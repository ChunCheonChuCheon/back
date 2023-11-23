import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { z } from 'zod';
import { AuthGuard } from '../auth/auth.guard';
import { GroupService } from './group.service';

@Controller('group')
export class GroupController {
    constructor(private readonly groupService: GroupService) {}

    @UseGuards(AuthGuard)
    @Post()
    async createGroup(@Body() rawBody: unknown) {
        const body = z
            .object({
                name: z.string(),
                location: z.string(),
                date: z.string(),
                adminId: z.number(),
                range: z.number(),
            })
            .parse(rawBody);

        return await this.groupService.createGroup(
            body.name,
            body.location,
            body.date,
            body.adminId,
            body.range,
        );
    }
}
