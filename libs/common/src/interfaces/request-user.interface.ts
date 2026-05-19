import { UserRole } from '@human-resource-management/shared-types'

export interface RequestUser {
  id: string
  role: UserRole
  email: string
}
