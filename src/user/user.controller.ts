import {
    Body,
    Controller,
    Get,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { z } from 'zod';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    // @Post()
    // async register(@Body() rawBody: unknown) {
    //     const body = z
    //         .object({
    //             id: z.string(),
    //             // password: z.string(),    // 라이트 버전을 위해 주석 처리
    //         })
    //         .parse(rawBody);

    //     return await this.userService.register(body.id);
    //     //await this.userService.register(body.id, body.password);  // 라이트 버전을 위해 주석 처리
    // }

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

    @UseGuards(AuthGuard)
    @Get('respondent')
    async isRespondent(@Request() request: any) {
        return await this.userService.isRespondent(request.user.userId);
    }
}
