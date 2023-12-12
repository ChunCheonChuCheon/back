import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { z } from 'zod';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('login/social/kakao')
    async getKakaoLoginURL() {
        return {
            url: `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`,
        };
    }

    @Post('login/social/kakao')
    async loginWithKakao(@Body() body: unknown) {
        const { code } = z
            .object({
                code: z.string(),
            })
            .parse(body);

        const id = await this.authService.getKakaoId(code);
        await this.authService.createUserIfNotExist(id);

        return {
            token: await this.authService.signUser(id),
        };
    }

    @UseGuards(AuthGuard)
    @Get('me')
    async me() {
        return 'ok';
    }
}
