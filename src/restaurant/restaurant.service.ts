import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RestaurantService {
    constructor(private readonly prisma: PrismaService) {}

    async getRestaurantInfomation(id: number) {
        return await this.prisma.restaurant.findUnique({
            where: {
                id,
            },
        });
    }
}
