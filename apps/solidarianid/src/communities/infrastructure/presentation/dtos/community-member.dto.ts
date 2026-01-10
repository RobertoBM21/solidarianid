import { ApiProperty } from '@nestjs/swagger';
import { MemberRoles } from '../../../domain/value-objects/member-role.vo';

export class CommunityMemberDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  communityId: string;
  @ApiProperty()
  userId: string;
  @ApiProperty({ enum: MemberRoles, enumName: 'MemberRoles' })
  role: MemberRoles;
}
