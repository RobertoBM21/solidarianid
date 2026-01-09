import { ApiProperty } from '@nestjs/swagger';
import { MembershipRequestStatus } from '../../../domain/membership-request-status.enum';

export class MembershipRequestDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  communityId: string;

  @ApiProperty({
    example: MembershipRequestStatus.PENDING,
    enum: MembershipRequestStatus,
    enumName: 'MembershipRequestStatus',
  })
  status: MembershipRequestStatus;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: string;
}
