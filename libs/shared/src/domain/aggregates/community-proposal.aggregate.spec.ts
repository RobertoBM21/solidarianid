import { UniqueEntityID } from '../entity';
import { CommunityProposalAccepted } from '../events/community-proposal-accepted.event';
import { CommunityProposalRejected } from '../events/community-proposal-rejected.event';
import {
  CommunityProposal,
  InvalidProposalStateError,
} from './community-proposal.aggregate';

describe('CommunityProposal Aggregate', () => {
  it('should update the accepted value when approved', () => {
    const proposalOrError = CommunityProposal.create({
      name: 'Valid Community Name',
      description: 'A valid description for the community proposal.',
      createdAt: new Date(),
      requesterId: UniqueEntityID.create().toString(),
      accepted: null,
    });

    expect(proposalOrError.isRight()).toBe(true);
    if (proposalOrError.isLeft()) return;
    const proposal = proposalOrError.value;

    const result = proposal.setAccepted(true);

    expect(result.isRight()).toBe(true);
    expect(proposal.accepted).toBe(true);
  });

  it('should generate domain event when approved', () => {
    const proposalOrError = CommunityProposal.create({
      name: 'Valid Community Name',
      description: 'A valid description for the community proposal.',
      createdAt: new Date(),
      requesterId: UniqueEntityID.create().toString(),
      accepted: null,
    });

    expect(proposalOrError.isRight()).toBe(true);
    if (proposalOrError.isLeft()) return;
    const proposal = proposalOrError.value;

    const result = proposal.setAccepted(true);

    expect(result.isRight()).toBe(true);
    const events = proposal.pullDomainEvents();
    expect(events).toContainEqual(expect.any(CommunityProposalAccepted));
  });

  it('should update the accepted value when rejected', () => {
    const proposalOrError = CommunityProposal.create({
      name: 'Valid Community Name',
      description: 'A valid description for the community proposal.',
      createdAt: new Date(),
      requesterId: UniqueEntityID.create().toString(),
      accepted: null,
    });

    expect(proposalOrError.isRight()).toBe(true);
    if (proposalOrError.isLeft()) return;
    const proposal = proposalOrError.value;

    const result = proposal.setAccepted(false);

    expect(result.isRight()).toBe(true);
    expect(proposal.accepted).toBe(false);
  });

  it('should generate domain event when rejected', () => {
    const proposalOrError = CommunityProposal.create({
      name: 'Valid Community Name',
      description: 'A valid description for the community proposal.',
      createdAt: new Date(),
      requesterId: UniqueEntityID.create().toString(),
      accepted: null,
    });

    expect(proposalOrError.isRight()).toBe(true);
    if (proposalOrError.isLeft()) return;
    const proposal = proposalOrError.value;

    const result = proposal.setAccepted(false);

    expect(result.isRight()).toBe(true);
    const events = proposal.pullDomainEvents();
    expect(events).toContainEqual(expect.any(CommunityProposalRejected));
    const rejectedEvent = events.find(
      (e) => e instanceof CommunityProposalRejected,
    )!;
    expect(rejectedEvent.proposalId).toBe(proposal.id.toString());
    expect(rejectedEvent.name).toBe('Valid Community Name');
    expect(rejectedEvent.description).toBe(
      'A valid description for the community proposal.',
    );
    expect(rejectedEvent.requesterId).toBe(proposal.requesterId);
  });

  it('should not allow setting accepted status if already finalized', () => {
    const proposalOrError = CommunityProposal.create({
      name: 'Valid Community Name',
      description: 'A valid description for the community proposal.',
      createdAt: new Date(),
      requesterId: UniqueEntityID.create().toString(),
      accepted: true,
    });

    expect(proposalOrError.isRight()).toBe(true);
    if (proposalOrError.isLeft()) return;
    const proposal = proposalOrError.value;

    const rejectResult = proposal.setAccepted(true);

    expect(rejectResult.isLeft()).toBe(true);
    if (rejectResult.isLeft()) {
      expect(rejectResult.value).toBeInstanceOf(InvalidProposalStateError);
    }
  });
});
