import { MyCollaborationsDto } from '../dtos/my-collaborations.dto';

export abstract class CollaborationHistoryPort {
  abstract getUserCollaborations(
    userId: string,
    order: 'ASC' | 'DESC',
  ): Promise<MyCollaborationsDto>;
}
