import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { Response } from 'express';
import type { GatewayRequest } from '../types';

@Injectable()
export class ProxyService {
  constructor(private readonly config: ConfigService) {}

  async forward(
    req: GatewayRequest,
    res: Response,
    serviceEnvKey: string,
    path: string,
  ): Promise<void> {
    const baseUrl = this.config.get<string>(serviceEnvKey);
    const headers = this.buildHeaders(req);

    try {
      const response = await axios({
        method: req.method as 'GET' | 'POST' | 'PATCH' | 'DELETE',
        url: `${baseUrl}${path}`,
        headers,
        data: req.body,
        params: req.query,
        validateStatus: () => true,
      });
      res.status(response.status).json(response.data);
    } catch {
      res.status(502).json({ message: 'Upstream service unavailable' });
    }
  }

  async forwardAuto(
    req: GatewayRequest,
    res: Response,
    serviceEnvKey: string,
    path: string,
  ): Promise<void> {
    const contentType = (req.headers['content-type'] as string) ?? '';
    if (contentType.includes('multipart/form-data')) {
      await this.forwardStream(req, res, serviceEnvKey, path);
    } else {
      await this.forward(req, res, serviceEnvKey, path);
    }
  }

  private async forwardStream(
    req: GatewayRequest,
    res: Response,
    serviceEnvKey: string,
    path: string,
  ): Promise<void> {
    const baseUrl = this.config.get<string>(serviceEnvKey);
    const headers = this.buildHeaders(req);

    try {
      const response = await axios({
        method: req.method as 'POST' | 'PATCH',
        url: `${baseUrl}${path}`,
        headers,
        data: req,
        params: req.query,
        validateStatus: () => true,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
      res.status(response.status).json(response.data);
    } catch {
      res.status(502).json({ message: 'Upstream service unavailable' });
    }
  }

  private buildHeaders(req: GatewayRequest): Record<string, string> {
    const headers: Record<string, string> = {};
    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'] as string;
    }
    if (req.headers['accept']) {
      headers['accept'] = req.headers['accept'] as string;
    }
    if (req.user) {
      headers['x-user-id'] = req.user.id;
      headers['x-user-role'] = req.user.role;
      headers['x-user-email'] = req.user.email;
    }
    return headers;
  }
}
