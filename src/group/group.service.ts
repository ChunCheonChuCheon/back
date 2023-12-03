import { ConsoleLogger, Injectable, NotFoundException } from '@nestjs/common';
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

    async getGroupSurveyResult(pin: string) {
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
        const categoryNumber = await this.prisma.category.count();
        const categorySummation: number[] = Array.from(
            { length: categoryNumber },
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

        // 그룹 인원수 가져오기
        const groupSize = await this.prisma.userGroup.count({
            where: {
                groupId: parseInt(pin),
            },
        });

        // 무응답자 수 가져오기
        let noResponseNumber = 0;
        categoryList.forEach((item) => {
            if (item.length !== categoryNumber) {
                noResponseNumber++;
            }
        });

        return { top3Category, groupSize, noResponseNumber };
    }

    async getGroupRecommendation(
        pin: string,
        top3Category: { category: string; vote: number }[],
    ) {
        //각 카테고리별 음식점 리스트를 가져와서 후보군들로 선정
        const candidateRestaurants = await Promise.all(
            top3Category.map(async (item) => {
                return await this.prisma.restaurant.findMany({
                    where: {
                        category: item.category,
                    },
                    select: {
                        id: true,
                        locationX: true,
                        locationY: true,
                    },
                });
            }),
        );
        if (candidateRestaurants === null) {
            return [];
        }

        // 그룹의 위도 경도를 가져와서 차후에 음식점과의 거리 계산에 활용
        const groupLocation = await this.prisma.group.findUnique({
            where: {
                pin: parseInt(pin),
            },
            select: {
                locationX: true,
                locationY: true,
            },
        });
        if (groupLocation === null) {
            throw new NotFoundException(
                '그룹 location을 찾던중 해당하는 그룹 정보를 차지 못했습니다.',
            );
        }

        const distanceList = candidateRestaurants.map(
            (restaurantListGroupByCategory) =>
                restaurantListGroupByCategory
                    .map((restaurant) => {
                        const distance = this.haversine(
                            Number(groupLocation.locationX),
                            Number(groupLocation.locationY),
                            Number(restaurant.locationX),
                            Number(restaurant.locationY),
                        );
                        return { id: restaurant.id, distance };
                    })
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, 3),
        );

        return { recommendation: distanceList.flat() };
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

    toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // 지구의 반지름 (단위: 킬로미터)

        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c;
        return distance;
    }
}
