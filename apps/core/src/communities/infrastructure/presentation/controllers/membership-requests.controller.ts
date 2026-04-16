import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthId } from '../../../../identity/infrastructure/decorators/auth-id.decorator';
import { AuthGuard } from '../../../../identity/infrastructure/guards/auth.guard';
import { MembershipRequestsPort } from '../../../application/ports/membership-requests.port';
import { UserIsNotAdminError } from '../../../domain/community.aggregate';
import { CommunityNotFoundError } from '../../../domain/repositories/community.repository';
import { MembershipRequestNotFoundError } from '../../../domain/repositories/membership-request.repository';
import { MembershipRequestDto } from '../dtos/membership-request.dto';
import { ReviewMembershipRequestDto } from '../dtos/review-membership-request.dto';

@Controller()
@ApiTags('memberships')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class MembershipRequestsController {
  constructor(private readonly membershipPort: MembershipRequestsPort) {}

  @Post('communities/:id/membership-requests')
  @ApiCreatedResponse({
    description: 'Membership requested successfully',
    type: MembershipRequestDto,
  })
  async requestMembership(
    @Param('id') communityId: string,
    @AuthId() userId: string,
  ): Promise<MembershipRequestDto> {
    const result = await this.membershipPort.requestMembership(
      userId,
      communityId,
    );

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof CommunityNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
    return result.value;
  }

  @Get('communities/:id/membership-requests')
  @ApiOkResponse({
    description: 'List of pending membership requests for a community',
    type: [MembershipRequestDto],
  })
  async listPendingRequests(
    @Param('id') communityId: string,
    @AuthId() userId: string,
  ): Promise<MembershipRequestDto[]> {
    const result = await this.membershipPort.listPendingRequests(
      userId,
      communityId,
    );

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof CommunityNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof UserIsNotAdminError) {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  @Put('membership-requests/:requestId')
  @ApiOkResponse({
    description: 'Review a membership request',
    type: MembershipRequestDto,
  })
  async reviewRequest(
    @Param('requestId') requestId: string,
    @AuthId() userId: string,
    @Body() dto: ReviewMembershipRequestDto,
  ): Promise<MembershipRequestDto> {
    const result = await this.membershipPort.reviewRequest(
      userId,
      requestId,
      dto.verdict,
    );

    if (result.isLeft()) {
      const error = result.value;
      if (
        error instanceof CommunityNotFoundError ||
        error instanceof MembershipRequestNotFoundError
      ) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof UserIsNotAdminError) {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  @Get('membership-requests/mine')
  @ApiOkResponse({
    description: 'List of my membership requests',
    type: [MembershipRequestDto],
  })
  listMyRequests(@AuthId() userId: string): Promise<MembershipRequestDto[]> {
    return this.membershipPort.listUserRequests(userId);
  }
}
