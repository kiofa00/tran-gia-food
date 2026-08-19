const net = require('net');
const { execSync, spawnSync } = require('child_process');

function isPortOpen(port, host = '127.0.0.1', timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;

    socket.setTimeout(timeout);
    socket.once('connect', () => {
      status = true;
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function runCmd(command) {
  try {
    return execSync(command, { stdio: 'pipe', encoding: 'utf-8' });
  } catch (error) {
    return null;
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function ensureCmsDatabase() {
  try {
    const pgPath = require.resolve('pg', { paths: ['./apps/cms', './backend'] });
    const { Client } = require(pgPath);
    const client = new Client({
      host: process.env.DATABASE_HOST || '127.0.0.1',
      port: Number(process.env.DATABASE_PORT) || 5432,
      user: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: 'postgres',
    });
    await client.connect();
    try {
      await client.query('CREATE DATABASE trangiadelivery_cms;');
      console.log('[Services] 📦 Database trangiadelivery_cms created.');
    } catch (err) {
      if (err.code !== '42P04') {
        // 42P04 = duplicate_database
        console.warn(`[Services] Note on CMS DB: ${err.message}`);
      }
    } finally {
      await client.end();
    }
  } catch {
    // Ignore error if pg package not found or unable to connect
  }
}

async function main() {
  const isPgOpen = await isPortOpen(5432);
  const isRedisOpen = await isPortOpen(6379);

  if (isPgOpen && isRedisOpen) {
    console.log('[Services] ✅ PostgreSQL (:5432) & Redis (:6379) are already running.');
    await ensureCmsDatabase();
    return;
  }

  console.log('[Services] ⏳ Checking & starting Database / Redis services...');

  // 1. Check Podman
  const podmanVersion = runCmd('podman --version');
  if (podmanVersion) {
    // Check podman machine status
    const machineList = runCmd('podman machine list');
    if (
      machineList &&
      !machineList.includes('Currently running') &&
      machineList.includes('podman-machine-default')
    ) {
      console.log('[Services] 🔄 Starting Podman machine...');
      runCmd('podman machine start');
    }

    // Try starting containers with podman
    console.log('[Services] 🔄 Starting containers (trangia_postgres, trangia_redis)...');
    runCmd('podman start trangia_postgres trangia_redis');

    // Fallback: try root WSL in case rootless socket is not attached
    const stillPgClosed = !(await isPortOpen(5432, '127.0.0.1', 500));
    if (stillPgClosed) {
      runCmd(
        'wsl -d podman-machine-default -u root -- podman start trangia_postgres trangia_redis',
      );
    }
  } else {
    // 2. Check Docker
    const dockerVersion = runCmd('docker --version');
    if (dockerVersion) {
      runCmd('docker start trangia_postgres trangia_redis');
    }
  }

  // Poll for up to 10 seconds for services to become available
  let ready = false;
  for (let i = 0; i < 10; i++) {
    const pg = await isPortOpen(5432);
    const redis = await isPortOpen(6379);
    if (pg && redis) {
      ready = true;
      break;
    }
    await sleep(1000);
  }

  if (ready) {
    console.log('[Services] ✅ PostgreSQL & Redis are ready!');
    await ensureCmsDatabase();
  } else {
    console.warn(
      '[Services] ⚠️ PostgreSQL / Redis could not be started automatically. Server will run in offline mode if DB is unreachable.',
    );
  }
}

main().catch((err) => {
  console.error('[Services] Error in ensure-services:', err);
  process.exit(0); // Do not crash pnpm dev if service check has non-fatal error
});
