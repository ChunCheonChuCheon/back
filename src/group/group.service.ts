import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupService {
    constructor(private readonly prisma: PrismaService) {}
    // Implements createGroup function which creates a group with the given location, date, and range and put database using prisma.
    async createGroup(location: string, date: string, range: string) {
        return await this.prisma.group.create({
            data: {
                location: location,
                date: date,
                range: range,
            },
        });
    }
}
