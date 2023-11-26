import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DishService {
    constructor(private readonly prisma: PrismaService) {}

    async getDish(dishId: number) {
        return await this.prisma.dish.findUnique({
            where: {
                id: dishId,
            },
        });
    }
}
