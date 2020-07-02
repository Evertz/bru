import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { GRPC_OPTIONS } from './grpc-otions';

const logger = new Logger('bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice(GRPC_OPTIONS);
  app.enableCors();

  await app.startAllMicroservicesAsync();
  await app.listen(3001, '0.0.0.0');

  return app;
}

bootstrap()
  .then(async app => {
    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log(`Ensure to add '--bes_backend=grpc://localhost:5000' as a flag to the bazel build`);
  })
  .catch(err => {
    logger.error('Error during bootstrap phase', err);
    process.exit(1);
  });
