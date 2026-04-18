import { MyCollaborationsDto } from '@app/shared/application/dtos/my-collaborations.dto';

export abstract class CollaborationHistoryPort {
  abstract getUserCollaborations(
    userId: string,
    order: 'ASC' | 'DESC',
  ): Promise<MyCollaborationsDto>;
}
