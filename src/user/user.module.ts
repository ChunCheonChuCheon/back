import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    providers: [UserService],
    controllers: [UserController],
    imports: [AuthModule],
})
export class UserModule {}
