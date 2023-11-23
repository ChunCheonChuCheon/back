import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async register(loginId: string, password: string) {
        await this.prisma.user.create({
            data: {
                nickName: '기본닉네임',
                loginId: loginId,
                password: password,
            },
        });
    }
}
