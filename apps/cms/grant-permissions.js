const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/trangiadelivery_cms',
  });

  await client.connect();

  const actions = [
    'api::translation.translation.find',
    'api::translation.translation.findOne',
    'api::banner.banner.find',
    'api::banner.banner.findOne',
  ];

  for (const action of actions) {
    const existing = await client.query('SELECT id FROM up_permissions WHERE action = $1', [action]);
    let permId;

    if (existing.rows.length > 0) {
      permId = existing.rows[0].id;
    } else {
      const ins = await client.query('INSERT INTO up_permissions (action) VALUES ($1) RETURNING id', [action]);
      permId = ins.rows[0].id;
    }

    const linkCheck = await client.query(
      'SELECT * FROM up_permissions_role_links WHERE permission_id = $1 AND role_id = 2',
      [permId]
    );

    if (linkCheck.rows.length === 0) {
      await client.query('INSERT INTO up_permissions_role_links (permission_id, role_id) VALUES ($1, 2)', [
        permId,
      ]);
    }
  }

  console.log('✅ Public permissions granted successfully!');
  await client.end();
}

main().catch(console.error);
