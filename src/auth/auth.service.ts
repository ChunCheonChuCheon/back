import { Injectable, NotFoundException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly secret: string;
    constructor(private readonly prisma: PrismaService) {
        const secretValue = process.env.JWT_SECRET;
        if (secretValue === undefined) {
            throw new Error('JWT_SECRET is not defined');
        }
        this.secret = secretValue;
    }

    async login(loginId: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                loginId,
            },
        });
        if (user === null) {
            throw new NotFoundException('로그인 실패');
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            return {
                access_token: jwt.sign({ userId: user.id }, this.secret),
            };
        } else {
            throw new NotFoundException('로그인 실패');
        }
    }
}
