import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

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

    async login(id: string, password: string) {
        const data = await this.prisma.user.findUnique({
            where: {
                id,
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
