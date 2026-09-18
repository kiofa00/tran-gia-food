import { Module } from '@nestjs/common';

import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { WalletService } from './wallet.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [UsersController],
  providers: [UsersService, WalletService],
  exports: [UsersService, WalletService],
})
export class UsersModule {}
