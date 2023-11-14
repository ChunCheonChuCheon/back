import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { z } from 'zod';

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
}
