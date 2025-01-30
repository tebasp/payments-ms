import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Payments Microservice');

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        url: envs.NATS_SERVERS,
      },
    },
    // Activate pipes, filters, guards, interceptors
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();

  await app.listen(envs.PORT, () => {
    logger.log(`Server is running on http://localhost:${envs.PORT}`);
  });
}
bootstrap();
