import {
  GetMyCollaborationsQuery,
  UserCollaborationHistory,
} from '@app/shared/domain/queries/get-my-collaborations.query';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { CollaborationHistoryPort } from '../../../application/ports/collaboration-history.port';

@Controller()
@ApiExcludeController()
export class CollaborationEventsController {
  private readonly logger = new Logger(CollaborationEventsController.name);

  constructor(
    private readonly collaborationHistoryPort: CollaborationHistoryPort,
  ) {}

  @MessagePattern(GetMyCollaborationsQuery.name)
  async handleGetMyCollaborations(
    query: GetMyCollaborationsQuery,
  ): Promise<UserCollaborationHistory> {
    this.logger.debug(
      `Received collaborations query for userId: ${query.userId}`,
    );
    return this.collaborationHistoryPort.getUserCollaborations(
      query.userId,
      'ASC',
    );
  }
}
