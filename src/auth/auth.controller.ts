import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { raw } from '@prisma/client/runtime/library';
import { z } from 'zod';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() rawBody: unknown) {
        const body = z
            .object({
                id: z.string(),
                password: z.string(),
            })
            .parse(rawBody);

        return await this.authService.login(body.id, body.password);
    }

    @UseGuards(AuthGuard)
    @Get('me')
    async me() {
        return 'ok';
    }
}
