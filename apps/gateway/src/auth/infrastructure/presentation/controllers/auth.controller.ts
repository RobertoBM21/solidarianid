import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { LoginDto } from '../../../application/dtos/login.dto';
import { RegisterDto } from '../../../application/dtos/register.dto';
import { GatewayAuthPort } from '../../../application/ports/gateway-auth.port';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';

@Controller('auth')
@ApiTags('auth')
export class GatewayAuthController {
  private readonly logger = new Logger(GatewayAuthController.name);

  constructor(private readonly authService: GatewayAuthPort) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Req() req: ExpressRequest): AuthResponseDto {
    const user = req.user as { userId: string; email: string };
    return this.authService.generateJwt(user);
  }

  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ type: AuthResponseDto })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOkResponse({ description: 'Redirects to Google consent screen' })
  googleAuth(): void {
    // Guard automatically redirects to Google consent screen
  }

  @Get('google/callback')
  @ApiOkResponse({ type: AuthResponseDto })
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(
    @Req() req: ExpressRequest,
  ): Promise<AuthResponseDto> {
    this.logger.debug('Handling Google auth callback');
    const user = req.user as { email: string; name: string };
    return this.authService.signIn(user);
  }
}
