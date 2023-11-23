import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { z } from 'zod';

@Injectable()
export class GroupService {
    constructor(private readonly prisma: PrismaService) {}
    // Implements createGroup function which creates a group with the given location, date, and range and put database using prisma.
    async createGroup(
        name: string,
        location: string,
        date: string,
        adminId: number,
        range: number,
    ) {
        return await this.prisma.group.create({
            data: {
                name: name,
                location: location,
                date: date,
                adminId: adminId,
                range: range,
            },
        });
    }
}
