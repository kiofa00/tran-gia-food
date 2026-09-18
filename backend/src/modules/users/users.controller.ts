import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateAddressDto } from './dto/create-address.dto';
import { DepositWalletDto } from './dto/deposit-wallet.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { WalletService } from './wallet.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private walletService: WalletService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Lay profile cua minh' })
  getMe(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Cap nhat profile' })
  update(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Post('me/avatar')
  @ApiOperation({ summary: 'Upload anh dai dien' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: { originalname: string; buffer: Buffer; mimetype: string },
  ) {
    if (!file) {
      throw new BadRequestException('Vui long chon file anh');
    }
    return this.usersService.updateAvatar(user.id, file);
  }

  @Get('me/orders')
  @ApiOperation({ summary: 'Lich su don hang cua customer' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getOrderHistory(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.getOrderHistory(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('me/notifications')
  @ApiOperation({ summary: 'Danh sach thong bao' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getNotifications(@CurrentUser() user: User, @Query('page') page?: string) {
    return this.usersService.getNotifications(user.id, page ? parseInt(page) : 1);
  }

  @Get('me/notifications/unread-count')
  @ApiOperation({ summary: 'So thong bao chua doc' })
  getUnreadCount(@CurrentUser() user: User) {
    return this.usersService.getUnreadCount(user.id);
  }

  @Patch('me/notifications/:id/read')
  @ApiOperation({ summary: 'Danh dau thong bao da doc' })
  markRead(@CurrentUser() user: User, @Param('id') id: string) {
    return this.usersService.markNotificationRead(id, user.id);
  }

  @Patch('me/notifications/read-all')
  @ApiOperation({ summary: 'Danh dau tat ca thong bao da doc' })
  markAllRead(@CurrentUser() user: User) {
    return this.usersService.markAllNotificationsRead(user.id);
  }

  // --- Address endpoints ---
  @Get('me/addresses')
  @ApiOperation({ summary: 'Danh sach dia chi cua toi' })
  getAddresses(@CurrentUser() user: User) {
    return this.usersService.getAddresses(user.id);
  }

  @Post('me/addresses')
  @ApiOperation({ summary: 'Them dia chi moi' })
  createAddress(@CurrentUser() user: User, @Body() dto: CreateAddressDto) {
    return this.usersService.createAddress(user.id, dto);
  }

  @Patch('me/addresses/:id')
  @ApiOperation({ summary: 'Cap nhat dia chi' })
  updateAddress(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.usersService.updateAddress(user.id, id, dto);
  }

  @Delete('me/addresses/:id')
  @ApiOperation({ summary: 'Xoa dia chi' })
  deleteAddress(@CurrentUser() user: User, @Param('id') id: string) {
    return this.usersService.deleteAddress(user.id, id);
  }

  @Patch('me/addresses/:id/default')
  @ApiOperation({ summary: 'Dat lam dia chi mac dinh' })
  setDefaultAddress(@CurrentUser() user: User, @Param('id') id: string) {
    return this.usersService.setDefaultAddress(user.id, id);
  }

  // --- Wallet, Transactions & KYC endpoints ---
  @Get('me/wallet')
  @ApiOperation({ summary: 'Lay thong tin so du vi cua toi' })
  getWallet(@CurrentUser() user: User) {
    return this.walletService.getWallet(user.id);
  }

  @Post('me/wallet/deposit')
  @ApiOperation({ summary: 'Nap tien vao vi' })
  depositWallet(@CurrentUser() user: User, @Body() dto: DepositWalletDto) {
    return this.walletService.deposit(user.id, dto);
  }

  @Get('me/transactions')
  @ApiOperation({ summary: 'Lich su giao dich vi' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getTransactions(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.walletService.getTransactions(
      user.id,
      limit ? parseInt(limit, 10) : 20,
      page ? parseInt(page, 10) : 1,
    );
  }

  @Get('me/banks')
  @ApiOperation({ summary: 'Danh sach tai khoan ngan hang lien ket' })
  getBanks(@CurrentUser() user: User) {
    return this.walletService.getBanks(user.id);
  }

  @Get('me/kyc')
  @ApiOperation({ summary: 'Trang thai xac minh eKYC' })
  getKyc(@CurrentUser() user: User) {
    return this.walletService.getKycStatus(user.id);
  }
}
