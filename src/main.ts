import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function main() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('main');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Teslo Shop API')
    .setDescription('Teslo Shop endpoints description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, document);

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Server running on port ${process.env.PORT}`);
}
main().catch((err) => console.error(err));
