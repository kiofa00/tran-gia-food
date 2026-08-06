import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { CmsService } from './cms.service';

@ApiTags('cms')
@Controller('cms')
export class CmsController {
  constructor(private cmsService: CmsService) {}

  @Public()
  @Get('status')
  @ApiOperation({ summary: '[Gateway] Trạng thái kết nối Strapi CMS & dữ liệu cache' })
  getStatus() {
    return this.cmsService.getCmsStatus();
  }

  @Public()
  @Get('banners')
  @ApiOperation({ summary: '[Gateway] Danh sách Banner Marketing từ CMS' })
  getBanners() {
    return this.cmsService.getBanners();
  }

  @Public()
  @Get('translations')
  @ApiOperation({ summary: '[Gateway] Từ điển đa ngôn ngữ (i18n) từ CMS' })
  getTranslations() {
    return this.cmsService.getTranslations();
  }

  @Public()
  @Get('announcements')
  @ApiOperation({ summary: '[Gateway] Thông báo hệ thống từ CMS' })
  getAnnouncements() {
    return this.cmsService.getAnnouncements();
  }

  @Public()
  @Get('faqs')
  @ApiOperation({ summary: '[Gateway] Hướng dẫn & FAQ từ CMS' })
  getFaqs() {
    return this.cmsService.getFaqs();
  }
}
