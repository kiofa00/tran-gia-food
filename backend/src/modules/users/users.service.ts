import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    const userObj = { ...user } as Record<string, unknown>;
    delete userObj.passwordHash;
    return userObj as Partial<User>;
  }

  async update(id: string, dto: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
    });
    const userObj = { ...user } as Record<string, unknown>;
    delete userObj.passwordHash;
    return userObj as Partial<User>;
  }

  async updateFcmToken(id: string, fcmToken: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { fcmToken },
    });
  }
}
