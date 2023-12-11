import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { promisify } from 'util';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    /* GET */
    async isRespondent(userId: number) {
        const result = await this.prisma.userCategory.findMany({
            where: {
                userId: userId,
            },
        });

        const categoryCount = await this.prisma.category.count();

        return { result: result.length === categoryCount ? true : false };
    }

    /* POST */
    async register(loginId: string, password: string) {
        /* 비밀번호 단방향 암호화 */
        const randomBytesPromise = promisify(crypto.randomBytes);
        const pbkdf2Promise = promisify(crypto.pbkdf2);

        const salt = (await randomBytesPromise(32)).toString('base64');
        const key = await pbkdf2Promise(password, salt, 256, 64, 'sha512');
        const hashedPassword = key.toString('base64');

        /* 유저 생성 */
        await this.prisma.user.create({
            data: {
                nickName: '기본닉네임',
                loginId: loginId,
                password: hashedPassword,
                salt: salt,
            },
        });
    }

    async submitSurvey(
        survey: { category: number; score: number }[],
        userId: number,
    ) {
        survey.forEach(async (item) => {
            await this.prisma.userCategory.upsert({
                where: {
                    userId_categoryId: {
                        userId: userId,
                        categoryId: item.category,
                    },
                },
                update: {
                    score: item.score,
                },
                create: {
                    userId: userId,
                    categoryId: item.category,
                    score: item.score,
                },
            });
        });

        return 0;
    }

    /* Logic Functions */
}
