import { ProfileOutDto } from '@app/shared/application/dtos/profile-out.dto';

export abstract class GetUserPort {
  abstract getUser(userId: string): Promise<ProfileOutDto | null>;
}
