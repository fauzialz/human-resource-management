import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'

/**
 * Register this guard globally in every internal NestJS service
 * (employee-service, attendance-service, log-consumer) to reject any
 * request that did not pass through Gateway.
 */
@Injectable()
export class InternalOnlyGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>()
    const userId = request.headers['x-user-id']
    if (!userId) {
      throw new ForbiddenException('Direct access to internal services is not permitted')
    }
    return true
  }
}
