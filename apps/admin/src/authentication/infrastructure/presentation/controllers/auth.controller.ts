import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AdminSession } from '../../../../presentation/session-data';
import { LoginDto } from '../../../application/dtos/login.dto';
import { RegisterDto } from '../../../application/dtos/register.dto';
import { AuthPort } from '../../../application/ports/auth.port';
import { LoggedInGuard } from '../guards/logged-in.guard';
import { LoggedOutGuard } from '../guards/logged-out.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authPort: AuthPort) {}

  @Get('login')
  @UseGuards(LoggedOutGuard)
  @Render('auth/login')
  showLoginForm() {
    return;
  }

  @Post('login')
  @UseGuards(LoggedOutGuard)
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const result = await this.authPort.login(loginDto);

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    (req.session as AdminSession).userId = result.value.id;
  }

  @Get('register')
  @UseGuards(LoggedOutGuard)
  @Render('auth/register')
  showRegisterForm() {
    return;
  }

  @Post('register')
  @UseGuards(LoggedOutGuard)
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    const result = await this.authPort.register(registerDto);

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    (req.session as AdminSession).userId = result.value.id;
  }

  @UseGuards(LoggedInGuard)
  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy(() => {
      res.redirect('/auth/login');
    });
  }
}
