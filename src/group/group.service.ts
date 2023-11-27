import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ZodDate, z } from 'zod';
import { find } from 'rxjs';
import { DishService } from 'src/dish/dish.service';

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
            },
            recommendedDishes: {},
        }
    */
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
            // 그룹 정보를 반환, 단 그룹에 멤버가 없는 경우 추가
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
        const memberList = this.findMembers(pin);
        // memberList를 활용하여서, 그룹 멤버들이 좋아하는 음식의 리스트를 제작
        const dishList = await Promise.all(
            (await memberList).map(
                async (member) =>
                    await this.dish.getFavoriteDishList(member).then((data) =>
                        z
                            .object({ dishId: z.number() })
                            .array()
                            .parse(data)
                            .map((item) => item.dishId),
                    ),
            ),
        );

        console.log(dishList);

        return this.getGroupInfo(pin);
    }

    /*
        그룹의 멤버들을 number 리스트 형태로 반환합니다.
        ex) [1, 2, 3, 4, 5]
    */
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

    async createGroup(
        name: string,
        location: string,
        date: string,
        adminId: number,
        range: number,
    ) {
        /* UTC 기준의 시간을 UTC+9으로 수정 */
        const koreanDate = new Date(date);
        koreanDate.setHours(koreanDate.getHours() + 9);

        /* DB에 그룹 생성 */
        const result = await this.prisma.group.create({
            data: {
                name: name,
                location: location,
                date: koreanDate,
                adminId: adminId,
                range: range,
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
}
