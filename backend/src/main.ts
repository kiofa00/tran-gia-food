import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Serve static uploads (e.g. user avatars)
  const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads'), {
      setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Dynamic CORS Configuration from Environment Variables
  const corsOrigins = process.env.CORS_ORIGINS || '*';
  app.enableCors({
    origin:
      corsOrigins === '*'
        ? true
        : (origin, callback) => {
            if (!origin) return callback(null, true);
            const allowed = corsOrigins.split(',').map((s) => s.trim());
            if (
              allowed.includes(origin) ||
              allowed.includes('*') ||
              (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:'))
            ) {
              return callback(null, true);
            }
            return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
          },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown fields
      forbidNonWhitelisted: false,
      transform: true, // auto-transform types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger / OpenAPI
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Tran Gia Food API')
      .setDescription('Food delivery platform REST API')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User profile management')
      .addTag('restaurants', 'Restaurant management')
      .addTag('menu', 'Menu categories and items')
      .addTag('orders', 'Order management')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log(`Swagger docs: http://localhost:${process.env.PORT!}/api-docs`);
  }

  const port = Number(process.env.PORT!);
  await app.listen(port);
  logger.log(`🚀 Server running on http://localhost:${port}/api/v1`);
}

bootstrap();
