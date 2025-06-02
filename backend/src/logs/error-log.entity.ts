import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum ErrorLevel {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

@Entity()
export class ErrorLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column({
    type: 'enum',
    enum: ErrorLevel,
    default: ErrorLevel.ERROR
  })
  level: ErrorLevel;

  @Column({ nullable: true })
  stack?: string;

  @Column({ nullable: true })
  userId?: number;

  @Column({ nullable: true })
  endpoint?: string;

  @CreateDateColumn()
  createdAt: Date;
} 