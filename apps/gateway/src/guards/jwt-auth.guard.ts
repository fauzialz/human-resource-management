import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { UserRole } from '@human-resource-management/shared-types'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import type { GatewayRequest } from '../types'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest<GatewayRequest>()

    const token = this.extractTokenFromHeader(request)
    if (!token) throw new UnauthorizedException('Missing authentication token')

    try {
      const payload = this.jwtService.verify<{
        sub: string
        email: string
        role: string
      }>(token)
      request.user = { id: payload.sub, email: payload.email, role: payload.role as UserRole }
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }

    return true
  }

  private extractTokenFromHeader(request: GatewayRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
