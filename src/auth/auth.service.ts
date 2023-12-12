import { Injectable, NotFoundException, Req } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { promisify } from 'util';
import axios from 'axios';

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

    async kakaoLogin(code: string) {
        /* 카카오 인가 코드로 토큰 받아오기 */
        const response = await axios.post(
            'https://kauth.kakao.com/oauth/token',
            `grant_type=authorization_code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&code=${code}`,
            {
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded;charset=utf-8',
                },
            },
        );

        /**
         * 토큰으로 유저 정보 조회
         *  {
         *    access_token,
         *    token_type,
         *    refresh_token,
         *    expires_in,
         *    refresh_token_expires_in,
         *  }
         */
        const userInfo = await this.getKakaoUserInfo(
            response.data.access_token,
        );

        console.log(userInfo.id);
        /* 유저 생성또는 토큰 갱신 */
        await this.prisma.user.upsert({
            where: {
                id: userInfo.id,
            },
            update: {
                kakaoAccessToken: response.data.access_token,
                kakaoRefreshToken: response.data.refresh_token,
            },
            create: {
                id: userInfo.id,
                nickName: '기본닉네임',
                kakaoAccessToken: response.data.access_token,
                kakaoRefreshToken: response.data.refresh_token,
            },
        });

        return { access_token: jwt.sign({ userId: userInfo.id }, this.secret) };
    }

    async getKakaoUserInfo(access_token: string) {
        const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return response.data;
    }
}
