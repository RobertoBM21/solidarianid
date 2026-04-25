import { MyCollaborationsDto } from '@app/shared/application/dtos/my-collaborations.dto';
import { AuthGuard, AuthId } from '@app/shared/infrastructure/auth';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CollaborationHistoryPort } from '../../../application/ports/collaboration-history.port';

@Controller()
@UseGuards(AuthGuard)
@ApiTags('initiatives')
@ApiBearerAuth()
export class CollaborationController {
  constructor(
    private readonly collaborationHistoryPort: CollaborationHistoryPort,
  ) {}

  @Get('my-collaborations')
  @ApiOkResponse({
    type: MyCollaborationsDto,
  })
  @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
  async getMyCollaborations(
    @AuthId() userId: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<MyCollaborationsDto> {
    return this.collaborationHistoryPort.getUserCollaborations(
      userId,
      order ?? 'ASC',
    );
  }
}
