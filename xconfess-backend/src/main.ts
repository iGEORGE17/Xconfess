import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ThrottlerExceptionFilter } from './common/filters/throttler-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { RequestIdMiddleware } from './middleware/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Request-ID middleware — must be first so all downstream code sees it
  const requestIdMiddleware = new RequestIdMiddleware();
  app.use(requestIdMiddleware.use.bind(requestIdMiddleware));
  app.enableShutdownHooks();
  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      threshold: 1024,
    }),
  );

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new ThrottlerExceptionFilter());

  // Swagger / OpenAPI setup — available in non-production
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('xConfess API')
      .setDescription(
        'Anonymous confession platform API — confessions, reactions, messages, reports, admin, and Stellar integration.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Authentication endpoints')
      .addTag(
        'Confessions',
        'Confession CRUD, search, tags, and Stellar anchoring',
      )
      .addTag('Reactions', 'Emoji reactions on confessions')
      .addTag('Messages', 'Anonymous messaging between users')
      .addTag('Reports', 'Report creation and moderation')
      .addTag('Admin', 'Admin dashboard and RBAC operations')
      .addTag('Tipping', 'XLM micro-tipping on Stellar')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/api-docs', app, document);
  }

  // Migration verification check
  if (process.env.NODE_ENV !== 'test') {
    const { DataSource } = await import('typeorm');
    const { getTypeOrmConfig } = await import('./config/database.config');
    const { ConfigService } = await import('@nestjs/config');
    const configService = app.get(ConfigService);
    const dataSource = new DataSource(getTypeOrmConfig(configService) as any);

    try {
      await dataSource.initialize();
      const result = await dataSource.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'anonymous_confessions' 
        AND column_name IN ('view_count', 'search_vector');
      `);

      const columns = result.map((r: any) => r.column_name);
      if (!columns.includes('view_count') || !columns.includes('search_vector')) {
        console.warn('⚠️  Database schema may be out of sync. Missing view_count or search_vector columns.');
      } else {
        console.log('✅ Database schema verified.');
      }
      await dataSource.destroy();
    } catch (error) {
      console.error('❌ Failed to verify database schema during startup:', error.message);
    }
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
