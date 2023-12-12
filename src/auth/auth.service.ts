import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
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

    async createUserIfNotExist(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (user === null) {
            await this.prisma.user.create({
                data: {
                    id: userId,
                    nickName: '익명',
                },
            });
        }
    }

    async getKakaoId(code: string): Promise<number> {
        // 코드를 통해 토큰 받기
        const accessToken = await axios
            .post(
                'https://kauth.kakao.com/oauth/token',
                `grant_type=authorization_code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&code=${code}`,
                {
                    headers: {
                        'Content-Type':
                            'application/x-www-form-urlencoded;charset=utf-8',
                    },
                },
            )
            .then((response) => response.data.access_token);

        const kakaoUser = await axios
            .get('https://kapi.kakao.com/v2/user/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
            .then((response) => response.data);

        return kakaoUser.id;
    }

    async signUser(id: number): Promise<string> {
        return jwt.sign({ userId: id }, this.secret);
    }
}
