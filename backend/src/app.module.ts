import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { User } from './users/user.entity'
import { TilesModule } from './tiles/tiles.module'
import { LoginHistory } from './auth/login-history.entity'
import { ErrorLog } from './logs/error-log.entity'
import { LogsModule } from './logs/logs.module'
import { PointsModule } from './points/points.module'
import { Point } from './points/entities/point.entity'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, LoginHistory, ErrorLog, Point],
        synchronize: configService.get('DB_SYNC') === 'true',
        logging: true,
        logger: 'advanced-console',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    TilesModule,
    LogsModule,
    PointsModule,
  ],
})
export class AppModule {}
