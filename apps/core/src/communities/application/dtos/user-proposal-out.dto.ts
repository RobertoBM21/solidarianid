export class UserProposalOutDto {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
