import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { RegisterCredentialsDto } from './dto/register-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
import { LoginHistory, LoginAction } from './login-history.entity';
import { ErrorLog, ErrorLevel } from '../logs/error-log.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(LoginHistory)
    private loginHistoryRepository: Repository<LoginHistory>,
    @InjectRepository(ErrorLog)
    private errorLogRepository: Repository<ErrorLog>,
    private jwtService: JwtService,
  ) {}

  async register(registerCredentialsDto: RegisterCredentialsDto): Promise<User> {
    const { email, password, role } = registerCredentialsDto;
    
    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Создаем нового пользователя
    const user = this.userRepository.create({
      email,
      password,
      role,
    });

    // Сохраняем пользователя (пароль будет автоматически захеширован благодаря @BeforeInsert)
    return this.userRepository.save(user);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (user && await user.validatePassword(password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(authCredentialsDto: AuthCredentialsDto, ipAddress: string) {
    const { email, password } = authCredentialsDto;
    const user = await this.validateUser(email, password);

    if (!user) {
      // Записываем ошибку в лог
      const errorLog = this.errorLogRepository.create({
        level: ErrorLevel.ERROR,
        message: `Failed login attempt for email: ${email}`,
        stack: `IP Address: ${ipAddress}`,
      });
      await this.errorLogRepository.save(errorLog);
      
      throw new UnauthorizedException('Invalid credentials');
    }

    // Record login event
    const loginHistory = this.loginHistoryRepository.create({
      user_id: user.id,
      action: LoginAction.LOGIN,
      ip_address: ipAddress,
    });
    await this.loginHistoryRepository.save(loginHistory);

    const payload: JwtPayload = { email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }

  async logout(userId: string, ipAddress: string) {
    const loginHistory = this.loginHistoryRepository.create({
      user_id: userId,
      action: LoginAction.LOGOUT,
      ip_address: ipAddress,
    });
    await this.loginHistoryRepository.save(loginHistory);
  }

  async getLoginHistory() {
    return this.loginHistoryRepository.find({
      relations: ['user'],
      order: {
        timestamp: 'DESC'
      }
    });
  }
} 