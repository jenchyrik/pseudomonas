import { Controller, Get, Query } from '@nestjs/common';
import { LogsService } from './logs.service';
import { ErrorLog } from './error-log.entity';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async getLogs(): Promise<ErrorLog[]> {
    return this.logsService.findAll();
  }
} 