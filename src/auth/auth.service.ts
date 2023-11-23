import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

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
        const data = await this.prisma.user.findUnique({
            where: {
                loginId,
            },
        });

        if (!data) {
            throw new Error('User not found');
        }

        if (data.password !== password) {
            throw new Error('Password is incorrect');
        }
        return {
            access_token: jwt.sign(data, this.secret),
        };
    }
}
