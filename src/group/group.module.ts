import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DishModule } from 'src/dish/dish.module';

@Module({
    imports: [AuthModule, PrismaModule, DishModule, GroupModule],
    providers: [GroupService],
    controllers: [GroupController],
})
export class GroupModule {}
