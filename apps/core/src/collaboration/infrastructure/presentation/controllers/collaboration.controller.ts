import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthId } from '../../../../identity/infrastructure/decorators/auth-id.decorator';
import { AuthGuard } from '../../../../identity/infrastructure/guards/auth.guard';
import { MyCollaborationsDto } from '../../../application/dtos/my-collaborations.dto';
import { CollaborationHistoryPort } from '../../../application/ports/collaboration-history.port';

@Controller()
@UseGuards(AuthGuard)
@ApiTags('collaboration')
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
