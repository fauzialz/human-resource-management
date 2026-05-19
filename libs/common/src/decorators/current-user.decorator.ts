import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserRole } from '@human-resource-management/shared-types'
import { RequestUser } from '../interfaces/request-user.interface'

export const CurrentUser = createParamDecorator(
  (field: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user: RequestUser = {
      id: request.headers['x-user-id'] as string,
      role: request.headers['x-user-role'] as UserRole,
      email: request.headers['x-user-email'] as string,
    }
    return field ? user[field] : user
  },
)
