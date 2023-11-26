import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { DishModule } from './dish/dish.module';

@Module({
    imports: [PrismaModule, UserModule, AuthModule, GroupModule, DishModule],
    providers: [],
})
export class AppModule {}
