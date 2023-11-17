import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async register(id: string, password: string) {
        await this.prisma.user.create({
            data: {
                id,
                password,
            },
        });
    }
}
