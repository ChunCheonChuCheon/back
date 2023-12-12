import {
    Body,
    Controller,
    Get,
    Header,
    Post,
    Query,
    Redirect,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { raw } from '@prisma/client/runtime/library';
import { z } from 'zod';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('kakao-login')
    @Redirect(
        `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`,
    )
    kakaoRedirect() {}

    @Get('kakao/callback')
    async kakaoCallback(@Query('code') code: string, @Req() req: any) {
        const result = await this.authService.kakaoLogin(code);
        console.log(result);
        req.header('access_token', result.access_token).status(200).send();
        req.status(200).json({ access_token: result.access_token });
        // req.res.redirect(
        //     `http://localhost:3000?access_token=${result.access_token}`,
        // );
    }

    @UseGuards(AuthGuard)
    @Get('me')
    async me() {
        return 'ok';
    }
}
