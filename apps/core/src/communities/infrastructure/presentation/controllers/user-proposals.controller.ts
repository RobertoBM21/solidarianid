import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthId } from '../../../../identity/infrastructure/decorators/auth-id.decorator';
import { AuthGuard } from '../../../../identity/infrastructure/guards/auth.guard';
import { UserProposalOutDto } from '../../../application/dtos/user-proposal-out.dto';
import { UserProposalsPort } from '../../../application/ports/user-proposals.port';

@Controller()
@ApiTags('proposals')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class UserProposalsController {
  constructor(private readonly userProposalsPort: UserProposalsPort) {}

  @Get('my-proposals')
  @ApiOkResponse({
    description: 'List of community proposals made by the user',
    type: [UserProposalOutDto],
  })
  async listMyProposals(
    @AuthId() userId: string,
  ): Promise<UserProposalOutDto[]> {
    return this.userProposalsPort.listUserProposals(userId);
  }
}
