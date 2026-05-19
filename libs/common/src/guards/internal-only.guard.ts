import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const SKIP_INTERNAL_GUARD_KEY = 'skipInternalGuard';
export const SkipInternalGuard = () =>
  SetMetadata(SKIP_INTERNAL_GUARD_KEY, true);

@Injectable()
export class InternalOnlyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_INTERNAL_GUARD_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (skip) return true;

    const request = ctx
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>();
    const userId = request.headers['x-user-id'];
    if (!userId) {
      throw new ForbiddenException(
        'Direct access to internal services is not permitted',
      );
    }
    return true;
  }
}
