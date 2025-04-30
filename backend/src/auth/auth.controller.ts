import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '../users/user.entity';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { RegisterCredentialsDto } from './dto/register-credentials.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerCredentialsDto: RegisterCredentialsDto) {
    return this.authService.register(registerCredentialsDto);
  }

  @Post('login')
  async login(@Body() authCredentialsDto: AuthCredentialsDto) {
    return this.authService.login(authCredentialsDto);
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