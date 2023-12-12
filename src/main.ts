import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    if (process.env.NODE_ENV === 'production') {
        app.enableCors({
            origin: ['https://chucheon.com'],
        });
    } else {
        app.enableCors();
    }
    await app.listen(3000);
}

bootstrap();
