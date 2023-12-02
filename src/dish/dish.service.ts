import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DishService {
    constructor(private readonly prisma: PrismaService) {}

    async getFavoriteDishList(userId: number) {
        return await this.prisma.userDish.findMany({
            where: {
                userId: userId,
            },
            select: {
                dishId: true,
            },
        });
    }
}
