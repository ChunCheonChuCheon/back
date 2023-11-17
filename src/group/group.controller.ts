import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { z } from 'zod';
import { AuthGuard } from '../auth/auth.guard';

@Controller('group')
export class GroupController {
    constructor(
        private readonly auth: AuthService,
        private readonly prisma: PrismaService,
    ) {}

    @UseGuards(AuthGuard)
    @Post()
    async createGroup(@Body() rawBody: unknown) {
        const body = z
            .object({
                location: z.string(),
                date: z.string(),
                range: z.string(),
            })
            .parse(rawBody);

        return await this.groupService.createGroup(
            body.location,
            body.date,
            body.range,
        );
    }
}
