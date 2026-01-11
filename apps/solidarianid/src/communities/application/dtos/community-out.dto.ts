import { CommunityListOut } from '../../../communities/domain/ports/community.port';
import { Community } from '../../domain/community.aggregate';

export class CommunityOutDto implements CommunityListOut {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly createdAt: string;

  constructor(data: Community) {
    this.id = data.id.toString();
    this.name = data.name;
    this.description = data.description;
    this.createdAt = data.createdAt.toISOString();
  }
}
