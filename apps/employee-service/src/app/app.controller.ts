import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipInternalGuard } from '@human-resource-management/common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @SkipInternalGuard()
  getData() {
    return this.appService.getData();
  }
}
