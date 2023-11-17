import { Injectable } from '@nestjs/common';

@Injectable()
export class GroupService {
    async createGroup(location: string, date: string, range: string) {
        return 'Hello World!';
    }
}
