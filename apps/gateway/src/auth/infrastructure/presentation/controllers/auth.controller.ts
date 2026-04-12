import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import {
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { LoginDto } from '../../../application/dtos/login.dto';
import { RegisterDto } from '../../../application/dtos/register.dto';
import { GatewayAuthPort } from '../../../application/ports/gateway-auth.port';
import authConfig from '../../config/auth.config';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';

@Controller('auth')
@ApiTags('auth')
export class GatewayAuthController {
  private readonly frontendUrl: string;

  constructor(
    private readonly authService: GatewayAuthPort,
    @Inject(authConfig.KEY)
    readonly config: ConfigType<typeof authConfig>,
  ) {
    this.frontendUrl = config.frontendUrl;
  }

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
  @UseGuards(GoogleAuthGuard)
  @ApiOkResponse({ description: 'Redirects to frontend with JWT token' })
  async googleAuthCallback(
    @Req() req: ExpressRequest,
    @Res() res: ExpressResponse,
  ): Promise<void> {
    const user = req.user as { email: string; name: string };
    const { access_token } = await this.authService.signIn(user);
    res.redirect(
      `${this.frontendUrl}/auth/callback?token=${encodeURIComponent(access_token)}`,
    );
  }
}
