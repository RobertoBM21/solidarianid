import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthId } from '../../../../identity/infrastructure/decorators/auth-id.decorator';
import { AuthGuard } from '../../../../identity/infrastructure/guards/auth.guard';
import { CreateVolunteerLogDto } from '../../../application/dtos/create-volunteer-log.dto';
import { VolunteerLogDto } from '../../../application/dtos/volunteer-log.dto';
import { VolunteerLogPort } from '../../../application/ports/volunteer-log.port';
import { VolunteerLogNotFoundError } from '../../../domain/repositories/volunteer-log.repository';

@Controller('volunteer-logs')
@ApiTags('volunteering')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class VolunteerLogsController {
  constructor(private readonly volunteerLogPort: VolunteerLogPort) {}

  @Post()
  @ApiBody({ type: CreateVolunteerLogDto })
  @ApiCreatedResponse({
    description: 'Volunteer log created successfully',
    type: VolunteerLogDto,
  })
  async createLog(
    @Body() dto: CreateVolunteerLogDto,
    @AuthId() userId: string,
  ): Promise<VolunteerLogDto> {
    const result = await this.volunteerLogPort.register(dto, userId);
    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Volunteer log canceled successfully',
  })
  async cancelLog(
    @Param('id') id: string,
    @AuthId() userId: string,
  ): Promise<void> {
    const result = await this.volunteerLogPort.cancel(id, userId);

    if (result.isLeft()) {
      if (result.value instanceof VolunteerLogNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
  }
}
