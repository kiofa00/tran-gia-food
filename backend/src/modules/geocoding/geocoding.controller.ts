import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/guards/jwt-auth.guard';
import { GeocodingService } from './geocoding.service';

@ApiTags('geocoding')
@Controller('geocoding')
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Public()
  @Get('reverse')
  @ApiOperation({ summary: 'Dịch ngược tọa độ lat, lng thành thông tin địa chỉ chi tiết' })
  @ApiQuery({ name: 'lat', type: Number, required: true, example: 10.7769 })
  @ApiQuery({ name: 'lng', type: Number, required: true, example: 106.7009 })
  async reverse(@Query('lat') latStr: string, @Query('lng') lngStr: string) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (isNaN(lat) || isNaN(lng)) {
      throw new BadRequestException('Tọa độ lat, lng không hợp lệ');
    }
    return this.geocodingService.reverse(lat, lng);
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm địa điểm / tên đường tại Việt Nam' })
  @ApiQuery({ name: 'q', type: String, required: true, example: 'Chợ Bến Thành' })
  async search(@Query('q') query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return this.geocodingService.search(query);
  }
}
