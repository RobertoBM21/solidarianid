import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from '../../../application/dtos/create-user.dto';
import { GoogleUserDto } from '../../../application/dtos/google-user.dto';
import { ValidateCredentialsDto } from '../../../application/dtos/validate-credentials.dto';
import { UserPort } from '../../../application/ports/user.port';

@Controller('auth')
@ApiTags('auth')
export class CoreAuthController {
  constructor(private readonly userService: UserPort) {}

  @Post('validate')
  @ApiBody({ type: ValidateCredentialsDto })
  @ApiCreatedResponse({ description: 'Credentials are valid' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async validateCredentials(
    @Body() dto: ValidateCredentialsDto,
  ): Promise<{ userId: string }> {
    const result = await this.userService.validateCredentials(
      dto.email,
      dto.password,
    );
    if (result.isLeft()) {
      throw new UnauthorizedException(result.value.message);
    }
    return result.value;
  }

  @Post('register')
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: 'User registered successfully' })
  @ApiBadRequestResponse({ description: 'Invalid registration data' })
  async register(@Body() dto: CreateUserDto): Promise<{ userId: string }> {
    const result = await this.userService.createLocalUser(dto);
    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }
    return { userId: result.value.id };
  }

  @Post('google-user')
  @ApiBody({ type: GoogleUserDto })
  @ApiCreatedResponse({ description: 'Google user found or created' })
  @ApiBadRequestResponse({ description: 'Invalid Google user data' })
  async googleUser(@Body() dto: GoogleUserDto): Promise<{ userId: string }> {
    const result = await this.userService.findOrCreateGoogleUser(
      dto.email,
      dto.name,
    );
    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }
}
