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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
