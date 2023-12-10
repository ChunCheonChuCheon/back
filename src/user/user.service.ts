import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
        await this.prisma.user.create({
            data: {
                nickName: '기본닉네임',
                loginId: loginId,
                password: password,
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
