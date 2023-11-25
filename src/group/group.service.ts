import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ZodDate, z } from 'zod';

@Injectable()
export class GroupService {
    async getGroup(pin: string) {
        const result = await this.prisma.group.findUnique({
            where: {
                pin: parseInt(pin),
            },
        });

        console.log(result);

        if (result === null) {
            return { response: 'Group not found' };
        } else {
            return { response: 'Ok' };
        }
    }
    constructor(private readonly prisma: PrismaService) {}
    // Implements createGroup function which creates a group with the given location, date, and range and put database using prisma.
    async createGroup(
        name: string,
        location: string,
        date: string,
        adminId: number,
        range: number,
    ) {
        const koreanDate = new Date(date);
        koreanDate.setHours(koreanDate.getHours() + 9);
        const result = await this.prisma.group.create({
            data: {
                name: name,
                location: location,
                date: koreanDate,
                adminId: adminId,
                range: range,
            },
        });

        const paddedPin = result.pin.toString().padStart(6, '0');
        return { pin: paddedPin };
    }
}
