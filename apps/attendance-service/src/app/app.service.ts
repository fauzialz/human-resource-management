import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly startTime = new Date();

  getData(): {
    service: string;
    status: string;
    uptime: string;
    startedAt: string;
  } {
    const uptimeMs = Date.now() - this.startTime.getTime();
    const uptimeSec = Math.floor(uptimeMs / 1000);
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = uptimeSec % 60;

    return {
      service: 'attendance-service',
      status: 'ok',
      uptime: `${hours}h ${minutes}m ${seconds}s`,
      startedAt: this.startTime.toISOString(),
    };
  }
}
