import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // TẠM TẮT JWT GUARD ĐỂ TEST (Bật lại khi sẵn sàng Auth)
    const disableAuth = process.env.DISABLE_AUTH !== 'false'; // Mặc định tạm tắt để test
    if (disableAuth) return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (process.env.DISABLE_AUTH !== 'false') {
      return user || { id: 'test-user', role: 'admin' };
    }
    if (err || !user) {
      return null;
    }
    return user;
  }
}

import { SetMetadata } from '@nestjs/common';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
