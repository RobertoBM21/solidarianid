import { UserProposalOutDto } from '../dtos/user-proposal-out.dto';

export abstract class UserProposalsPort {
  abstract listUserProposals(userId: string): Promise<UserProposalOutDto[]>;
}
