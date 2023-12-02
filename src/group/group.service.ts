import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ZodDate, z } from 'zod';
import { find } from 'rxjs';
import { DishService } from 'src/dish/dish.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class GroupService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly dish: DishService,
    ) {}

    /*
        PIN 번호로 참가 요청시 FE에 띄워줄 정보들을 JSON 형태로 반환
        {
            groupInfo: {
                name: string,
                location: string,
                date: Date,            
                range: number,
            }            
        }
    */
    /*
        {            
            TOP3 : [
                {
                    "name" : "한식",
                    "vote" : 5
                },
                {
                    "name" : "버거",
                    "vote" : 4
                },
                {
                    "name" : "중식",
                    "vote" : 3
                },
            ],            
        }

        {
            recommendedRestaurants: [
                {
                    "name": "프랭크버거",
                    "location": [37.555, 126.555],
                    "category": "버거",                    
                },
            ]
        }

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
                ...
            ]
        }
   */

    /* GET */
    async getGroup(pin: string, userId: number) {
        const result = await this.prisma.group.findUnique({
            where: {
                pin: parseInt(pin),
            },
        });

        if (result === null) {
            throw new NotFoundException(
                '해당하는 PIN의 그룹을 찾을 수 없습니다.',
            );
        } else if (
            // 그룹 기본 정보를 반환, 단 그룹에 멤버가 없는 경우 추가
            !(await this.prisma.userGroup.findFirst({
                where: { userId: userId, groupId: parseInt(pin) },
            }))
        ) {
            await this.prisma.userGroup.create({
                data: {
                    userId: userId,
                    groupId: parseInt(pin),
                },
            });
        }

        return this.getGroupInfo(pin);
    }

    async getGroupRecommendation(pin: string) {
        const memberList = await this.findMembers(pin);

        // memberList를 활용하여서, 그룹 멤버들의 카테고리 별 선호도를 구함
        const categoryList = await Promise.all(
            memberList.map(async (member) => {
                const categoryList = await this.getFavoriteCategoryList(member);
                return z
                    .object({
                        categoryId: z.number(),
                        score: z.number(),
                    })
                    .array()
                    .parse(categoryList)
                    .map((item) => item.score);
            }),
        );

        // 카테고리 별 점수 합산
        const categorySummation: number[] = Array.from(
            { length: categoryList.length ? categoryList[0].length : 0 },
            (_, columnIndex) =>
                categoryList.reduce(
                    (acc, member) => acc + (member[columnIndex] || 0),
                    0,
                ),
        );

        // 인덱싱 후 내림차순 정렬 후 상위 3개를 추출
        const indexedCategorySummation = categorySummation
            .map((value, index) => ({ index, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 3);

        // 인덱스에 맞게 카테고리 이름을 가져오고 JSON 형태로 반환
        const top3Category = await Promise.all(
            indexedCategorySummation.map(async (item) => {
                const category = await this.prisma.category.findUnique({
                    where: {
                        id: item.index + 1,
                    },
                });

                if (category === null) {
                    throw new NotFoundException(
                        '카테고리 정보를 탐색중 오류가 발생했습니다. - 백엔드 잘못',
                    );
                }

                return {
                    name: category.name,
                    vote: item.value,
                };
            }),
        );

        console.log(top3Category);

        return { top3: top3Category };
    }

    /* POST */
    async createGroup(
        name: string,
        locationX: number,
        locationY: number,
        date: Date,
        adminId: number,
        range: number,
    ) {
        /* DB에 그룹 생성 */
        const result = await this.prisma.group.create({
            data: {
                name,
                locationX,
                locationY,
                date,
                adminId,
                range,
            },
        });

        /* 그룹장을 Group members에 추가 */
        await this.prisma.userGroup.create({
            data: {
                userId: adminId,
                groupId: result.pin,
            },
        });

        /* FE 요청에따라 패딩된 PIN값 전달 */
        const paddedPin = result.pin.toString().padStart(6, '0');
        return { pin: paddedPin };
    }

    /* LogicFucntions */
    async findMembers(pin: string) {
        const result = await this.prisma.userGroup
            .findMany({
                where: {
                    groupId: parseInt(pin),
                },
                select: {
                    userId: true,
                },
            })
            .then((data) =>
                z
                    .object({ userId: z.number() })
                    .array()
                    .parse(data)
                    .map((item) => item.userId),
            );

        console.log(result);

        return result;
    }

    async getGroupInfo(pin: string) {
        const result = await this.prisma.group.findUnique({
            where: {
                pin: parseInt(pin),
            },
        });

        if (result === null) {
            throw new NotFoundException(
                '그룹 정보를 탐색중 오류가 발생했습니다. - 백엔드 잘못',
            );
        } else {
            return result;
        }
    }

    async getFavoriteCategoryList(userId: number) {
        return await this.prisma.userCategory.findMany({
            where: {
                userId: userId,
            },
            select: {
                categoryId: true,
                score: true,
            },
        });
    }
}
