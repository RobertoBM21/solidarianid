import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import type { MembershipRequestVerdict } from '../../../domain/membership-request-status.enum';
import { MembershipRequestStatus } from '../../../domain/membership-request-status.enum';

export class ReviewMembershipRequestDto {
  @ApiProperty({
    enum: [MembershipRequestStatus.ACCEPTED, MembershipRequestStatus.REJECTED],
    enumName: 'MembershipRequestVerdict',
  })
  @IsEnum(MembershipRequestStatus)
  verdict: MembershipRequestVerdict;
}
