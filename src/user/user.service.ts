import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    /*
        {
            survey: [
                {
                    "category" : 1,
                    "score" : 1
                },
                {
                    "category" : 2,
                    "score" : 0
                },
                {
                    "category" : 3,
                    "score" : 0
                },
                {
                    "category" : 4,
                    "score" : 0
                },
                {
                    "category" : 5,
                    "score" : 0
                },
                {
                    "category" : 6,
                    "score" : 0
                },
                {
                    "category" : 7,
                    "score" : 0
                },
                {
                    "category" : 8,
                    "score" : 0
                },
                {
                    "category" : 9,
                    "score" : 0
                },
                {
                    "category" : 10,
                    "score" : 0
                },
                {
                    "category" : 11,
                    "score" : 0
                },
                {
                    "category" : 12,
                    "score" : 0
                },
                {
                    "category" : 13,
                    "score" : 0
                },
                {
                    "category" : 14,
                    "score" : 0
                },
                {
                    "category" : 15,
                    "score" : 0
                },
                {
                    "category" : 16,
                    "score" : 0
                },
                {
                    "category" : 17,
                    "score" : 0
                },                
            ]
        }
    */

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
            // create UserCategory tuple using userId and category and score value
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
