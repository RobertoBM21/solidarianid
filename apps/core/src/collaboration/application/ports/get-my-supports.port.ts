import { UserSupportHistoryItem } from '@app/shared/application/dtos/my-collaborations.dto';

export abstract class GetMySupportsPort {
  abstract getMySupports(userId: string): Promise<UserSupportHistoryItem[]>;
}
