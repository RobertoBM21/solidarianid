import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProfileOutDto } from '../../../application/dtos/profile-out.dto';
import { UpdateProfileDto } from '../../../application/dtos/update-profile.dto';
import { UserPort } from '../../../application/ports/user.port';
import { UserNotFoundError } from '../../../domain/repositories/user.repository';
import { AuthId } from '../../decorators/auth-id.decorator';
import { AuthGuard } from '../../guards/auth.guard';

@Controller('profile')
@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly userPort: UserPort) {}

  @Get()
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    type: ProfileOutDto,
  })
  async getProfile(@AuthId() userId: string): Promise<ProfileOutDto> {
    const result = await this.userPort.getProfile(userId);
    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }
    return result.value;
  }

  @Put()
  @ApiOkResponse({
    description: 'User profile updated successfully',
    type: ProfileOutDto,
  })
  async updateProfile(
    @AuthId() userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileOutDto> {
    const result = await this.userPort.updateProfile(userId, dto);
    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
    return result.value;
  }
}
