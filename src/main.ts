import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger as NestLogger } from '@nestjs/common';
import { PinoLogger as NestPinoLogger } from 'nestjs-pino';
import { LoggerErrorInterceptor } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // PinoLogger is automatically set up by nestjs-pino module, no need to use app.useLogger(app.get(NestPinoLogger))
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  app.enableCors();
  app.use(helmet());

  // Global validation pipe for DTO validation and security
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('The NestJS API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  // Use NestJS Logger for consistent logging
  NestLogger.log(`Server running on http://localhost:${port}`, 'Bootstrap');
  NestLogger.log(`Swagger docs at http://localhost:${port}/api`, 'Bootstrap');
}
void bootstrap();
