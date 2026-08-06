import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

import { ROLES_KEY } from '../decorators/roles.decorator';

/** Returns true if auth is explicitly disabled via DISABLE_AUTH=true env var (opt-in, dev only) */
const isAuthDisabled = () => process.env['DISABLE_AUTH'] === 'true';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // TẠM TẮT ROLES GUARD ĐỂ TEST — đặt DISABLE_AUTH=true trong .env để bỏ qua auth
    if (isAuthDisabled()) return true;

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    const hasRole = requiredRoles.includes(user?.role);

    return hasRole;
  }
}
