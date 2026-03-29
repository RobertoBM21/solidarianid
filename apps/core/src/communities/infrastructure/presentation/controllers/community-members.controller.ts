import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthId } from '../../../../identity/infrastructure/decorators/auth-id.decorator';
import { AuthGuard } from '../../../../identity/infrastructure/guards/auth.guard';
import { CommunityMembersPort } from '../../../application/ports/community-members.port';
import {
  CannotExpelAdminError,
  MemberAlreadyAdminError,
} from '../../../domain/community-member.aggregate';
import { UserIsNotAdminError } from '../../../domain/community.aggregate';
import { CommunityMemberNotFoundError } from '../../../domain/repositories/community-member.repository';
import { CommunityMemberDto } from '../dtos/community-member.dto';

@Controller()
@ApiTags('communities')
@ApiSecurity('userId')
@UseGuards(AuthGuard)
export class CommunityMembersController {
  constructor(private readonly membersPort: CommunityMembersPort) {}

  @Get('communities/:id/members')
  @ApiOkResponse({
    description: 'List of community members',
    type: [CommunityMemberDto],
  })
  async listMembers(
    @Param('id') communityId: string,
    @AuthId() requesterId: string,
  ): Promise<CommunityMemberDto[]> {
    const result = await this.membersPort.listMembers(communityId, requesterId);

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof UserIsNotAdminError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof CommunityMemberNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  @Post('community-members/:memberId/promote')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Member promoted to admin successfully',
    type: CommunityMemberDto,
  })
  async promoteMember(
    @Param('memberId') memberId: string,
    @AuthId() requesterId: string,
  ): Promise<CommunityMemberDto> {
    const result = await this.membersPort.promoteMember(memberId, requesterId);

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof UserIsNotAdminError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof CommunityMemberNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof MemberAlreadyAdminError) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  @Delete('community-members/:memberId')
  @ApiOkResponse({
    description: 'Member expelled successfully',
  })
  async expelMember(
    @Param('memberId') memberId: string,
    @AuthId() requesterId: string,
  ): Promise<void> {
    const result = await this.membersPort.expelMember(memberId, requesterId);

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof UserIsNotAdminError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof CommunityMemberNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof CannotExpelAdminError) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(result.value.message);
    }
  }
}
