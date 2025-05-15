import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { UserRole } from '../users/user.entity';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { RegisterCredentialsDto } from './dto/register-credentials.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private getClientIp(request: Request): string {
    // Проверяем заголовки в порядке приоритета
    const ip = 
      request.headers['x-forwarded-for']?.toString().split(',')[0] || // Первый IP из X-Forwarded-For
      request.headers['x-real-ip']?.toString() || // X-Real-IP
      request.socket.remoteAddress || // Прямой IP
      '0.0.0.0'; // Запасной вариант

    // Убираем IPv6 префикс если есть
    return ip.replace(/^::ffff:/, '');
  }

  @Post('register')
  async register(@Body() registerCredentialsDto: RegisterCredentialsDto) {
    return this.authService.register(registerCredentialsDto);
  }

  @Post('login')
  async login(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Req() request: Request
  ) {
    const ipAddress = this.getClientIp(request);
    return this.authService.login(authCredentialsDto, ipAddress);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() request: Request) {
    const ipAddress = this.getClientIp(request);
    const userId = request.user['id'];
    await this.authService.logout(userId, ipAddress);
    return { message: 'Logged out successfully' };
  }

  @Get('login-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getLoginHistory() {
    return this.authService.getLoginHistory();
  }

  // Пример защищенного маршрута только для админов
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminRoute() {
    return { message: 'This route is only for admins!' };
  }

  // Пример защищенного маршрута для всех аутентифицированных пользователей
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  protectedRoute() {
    return { message: 'This is a protected route!' };
  }
} 