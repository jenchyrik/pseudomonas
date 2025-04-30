import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 5432,
  username: 'pseud',
  password: '12345678',
  database: 'pseud',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
}
