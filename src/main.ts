/* eslint-disable @typescript-eslint/no-var-requires */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // APP.USE OUT BECAUSE MIDDLEWARES ARE IN APP MODULE
  // app.use(
  //   cookieSession({
  //     keys: ['rtfgrsf'],
  //   }),
  // );

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //   }),
  // );

  await app.listen(3000);
}
bootstrap();
