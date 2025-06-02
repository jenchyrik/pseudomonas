import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorLog } from './error-log.entity';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ErrorLog])
  ],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [TypeOrmModule, LogsService]
})
export class LogsModule {} 