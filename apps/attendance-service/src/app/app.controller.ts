import { Controller, Get } from '@nestjs/common';
import { SkipInternalGuard } from '@human-resource-management/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @SkipInternalGuard()
  getData() {
    return this.appService.getData();
  }
}
