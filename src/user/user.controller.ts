import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { z } from 'zod';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    async register(@Body() rawBody: unknown) {
        const body = z
            .object({
                id: z.string(),
                password: z.string(),
            })
            .parse(rawBody);

        await this.userService.register(body.id, body.password);
    }

    @UseGuards(AuthGuard)
    @Post('survey')
    async submitSurvey(@Body() rawBody: unknown, @Request() request: any) {
        const body = z
            .object({
                survey: z.array(
                    z.object({
                        category: z.number(),
                        score: z.number(),
                    }),
                ),
            })
            .parse(rawBody);

        await this.userService.submitSurvey(body.survey, request.user.userId);
    }
}
