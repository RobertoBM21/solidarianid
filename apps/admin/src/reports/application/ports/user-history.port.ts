import { UserCollaborationHistory } from '@app/shared/application/dtos/my-collaborations.dto';

export abstract class UserHistoryPort {
  abstract getUserHistory(userId: string): Promise<UserCollaborationHistory>;
}
