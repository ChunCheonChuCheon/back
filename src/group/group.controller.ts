import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { z } from 'zod';
import { AuthGuard } from '../auth/auth.guard';
import { GroupService } from './group.service';
import { raw } from '@prisma/client/runtime/library';

@Controller('group')
export class GroupController {
    constructor(private readonly groupService: GroupService) {}

    @UseGuards(AuthGuard)
    @Get()
    async getGroup(@Query('pin') pin: string, @Body() rawBody: unknown) {
        console.log(rawBody);
        const body = z
            .object({
                userId: z.number(),
            })
            .parse(rawBody);
        return await this.groupService.getGroup(pin, body.userId);
    }

    @UseGuards(AuthGuard)
    @Post()
    async createGroup(@Body() rawBody: unknown) {
        const body = z
            .object({
                name: z.string(),
                location: z.string(),
                date: z.date(),
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
