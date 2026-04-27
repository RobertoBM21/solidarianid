export abstract class HandleCommunityProposalAcceptedPort {
  abstract handle(data: {
    name: string;
    description: string;
    requesterId: string;
    proposalId: string;
  }): Promise<void>;
}
