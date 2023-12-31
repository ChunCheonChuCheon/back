import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
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
    async getGroup(@Query('pin') pin: string, @Request() request: any) {
        return await this.groupService.getGroup(pin, request.user.userId);
    }

    @UseGuards(AuthGuard)
    @Get('/survey')
    async getGroupSurveyResult(@Query('pin') pin: string) {
        return await this.groupService.getGroupSurveyResult(pin);
    }

    @UseGuards(AuthGuard)
    @Get('/recommendation')
    async getGroupRecommendation(@Query('pin') pin: string) {
        return await this.groupService.getGroupRecommendation(pin);
    }

    @UseGuards(AuthGuard)
    @Post()
    async createGroup(@Body() rawBody: unknown, @Request() request: any) {
        const body = z
            .object({
                name: z.string(),
                location: z.array(z.number()),
                date: z.string(),
                range: z.number(),
            })
            .parse(rawBody);

        return await this.groupService.createGroup(
            body.name,
            body.location[0],
            body.location[1],
            new Date(body.date),
            request.user.userId,
            body.range,
        );
    }
}
