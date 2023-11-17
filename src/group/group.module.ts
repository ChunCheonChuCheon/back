import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [AuthModule, PrismaModule],
    providers: [GroupService],
    controllers: [GroupController],
})
export class GroupModule {}
