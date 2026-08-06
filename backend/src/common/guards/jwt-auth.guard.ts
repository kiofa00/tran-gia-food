import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

export const IS_PUBLIC_KEY = 'isPublic';

/** Returns true if auth is explicitly disabled via DISABLE_AUTH=true env var (opt-in, dev only) */
const isAuthDisabled = () => process.env['DISABLE_AUTH'] === 'true';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // TẠM TẮT JWT GUARD ĐỂ TEST — đặt DISABLE_AUTH=true trong .env để bỏ qua auth
    if (isAuthDisabled()) return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(err: Error | null, user: TUser) {
    if (isAuthDisabled()) {
      return user ?? null;
    }
    if (err || !user) {
      return null;
    }
    return user;
  }
}

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
