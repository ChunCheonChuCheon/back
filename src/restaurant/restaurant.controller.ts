import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { get } from 'http';
import { AuthGuard } from 'src/auth/auth.guard';
import { RestaurantService } from './restaurant.service';

@Controller('restaurant')
export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService) {}
    @UseGuards(AuthGuard)
    @Get()
    async getRestaurant(@Query('id') id: string) {
        return await this.restaurantService.getRestaurantInfomation(
            parseInt(id),
        );
    }
}
