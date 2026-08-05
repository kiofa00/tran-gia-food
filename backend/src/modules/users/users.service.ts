import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    delete (user as any).passwordHash;
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
    });
    delete (user as any).passwordHash;
    return user;
  }

  async updateFcmToken(id: string, fcmToken: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { fcmToken },
    });
  }
}
