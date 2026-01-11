import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Render,
  UseGuards,
} from '@nestjs/common';
import { LoggedInGuard } from '../../../../authentication/infrastructure/presentation/guards/logged-in.guard';
import { CommunityProposalsPort } from '../../../application/ports/community-proposals.port';
import { CommunityProposalNotFoundError } from '../../../domain/repositories/community-proposal.repository';

@Controller()
@UseGuards(LoggedInGuard)
export class CommunityProposalsController {
  constructor(private readonly service: CommunityProposalsPort) {}

  @Get('comunidades/validaciones')
  @Render('community-proposals/list')
  async listProposals() {
    const proposals = await this.service.listPendingProposals();
    return {
      title: 'Solicitudes de comunidad',
      proposals,
    };
  }

  @Post('comunidades/validaciones/:id/aprobar')
  async approveProposal(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.service.approve(id);
    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof CommunityProposalNotFoundError) {
        throw new NotFoundException('Community proposal not found');
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('comunidades/validaciones/:id/rechazar')
  async rejectProposal(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.service.reject(id);
    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof CommunityProposalNotFoundError) {
        throw new NotFoundException('Community proposal not found');
      }
      throw new BadRequestException(error.message);
    }
  }
}
