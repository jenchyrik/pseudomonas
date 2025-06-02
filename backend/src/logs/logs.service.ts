import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorLog, ErrorLevel } from './error-log.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(ErrorLog)
    private errorLogRepository: Repository<ErrorLog>
  ) {}

  async findAll(): Promise<ErrorLog[]> {
    return this.errorLogRepository.find({
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async logError(
    message: string,
    level: ErrorLevel = ErrorLevel.ERROR,
    stack?: string,
    userId?: number,
    endpoint?: string
  ): Promise<ErrorLog> {
    const errorLog = this.errorLogRepository.create({
      message,
      level,
      stack,
      userId,
      endpoint
    });

    return this.errorLogRepository.save(errorLog);
  }
} 