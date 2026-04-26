import { UniqueEntityID } from '@app/shared/domain';
import { InvalidDateError } from '@app/shared/domain/value-objects/creation-date.vo';
import { MembershipRequestAcceptedEvent } from './events/membership-request-accepted.event';
import { MembershipRequestRejectedEvent } from './events/membership-request-rejected.event';
import { MembershipRequest } from './membership-request.aggregate';

describe('MembershipRequest Aggregate', () => {
  const communityId = UniqueEntityID.create().toString();
  const userId = UniqueEntityID.create().toString();

  it('should create a pending MembershipRequest by default', () => {
    const result = MembershipRequest.create({ communityId, userId });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const request = result.value;
      expect(request.communityId.toString()).toBe(communityId);
      expect(request.userId.toString()).toBe(userId);
      expect(request.isPending()).toBe(true);
      expect(request.accepted).toBeNull();
      expect(request.createdAt).toBeInstanceOf(Date);
    }
  });

  it('should create an accepted MembershipRequest', () => {
    const result = MembershipRequest.create({
      communityId,
      userId,
      accepted: true,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const request = result.value;
      expect(request.isPending()).toBe(false);
      expect(request.accepted).toBe(true);
    }
  });

  it('should fail if creation date is invalid', () => {
    const invalidDate = 'invalid-date';
    const result = MembershipRequest.create({
      communityId,
      userId,
      createdAt: invalidDate,
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidDateError);
    }
  });

  it('should allow accepting a pending request', () => {
    const result = MembershipRequest.create({ communityId, userId });
    if (result.isRight()) {
      const request = result.value;
      request.accept();
      expect(request.isPending()).toBe(false);
      expect(request.accepted).toBe(true);
      expect(request.pullDomainEvents()).toEqual([
        expect.any(MembershipRequestAcceptedEvent),
      ]);
    }
  });

  it('should allow rejecting a pending request', () => {
    const result = MembershipRequest.create({ communityId, userId });
    if (result.isRight()) {
      const request = result.value;
      request.reject();
      expect(request.isPending()).toBe(false);
      expect(request.accepted).toBe(false);
      expect(request.pullDomainEvents()).toEqual([
        expect.any(MembershipRequestRejectedEvent),
      ]);
    }
  });

  it('should recreate an existing request with a given ID', () => {
    const existingId = UniqueEntityID.create().toString();
    const result = MembershipRequest.create(
      { communityId, userId },
      existingId,
    );

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.id.toString()).toBe(existingId);
    }
  });
});
