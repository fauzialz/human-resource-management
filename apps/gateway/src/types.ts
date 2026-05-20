import type { Request } from 'express';
import type { RequestUser } from '@human-resource-management/common';

export interface GatewayRequest extends Request {
  user?: RequestUser;
}

export type AuthenticatedRequest = GatewayRequest & {
  user: NonNullable<GatewayRequest['user']>;
};
