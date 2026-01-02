import { Community } from '../../domain/aggregates/community.aggregate';

export class CommunityOutDto {
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
