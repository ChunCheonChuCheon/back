import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';

@Module({
    imports: [PrismaModule, UserModule, AuthModule, GroupModule],
    providers: [],
})
export class AppModule {}
