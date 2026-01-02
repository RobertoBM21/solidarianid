import { AcceptedStatus } from './accepted-status.vo';

describe('AcceptedStatus Value Object', () => {
  it('should create an AcceptedStatus with accepted status', () => {
    const acceptedStatus = AcceptedStatus.create(true);
    expect(acceptedStatus.value).toBe(true);
    expect(acceptedStatus.isAccepted).toBe(true);
    expect(acceptedStatus.isRejected).toBe(false);
    expect(acceptedStatus.isPending).toBe(false);
  });

  it('should create an AcceptedStatus with rejected status', () => {
    const rejectedStatus = AcceptedStatus.create(false);
    expect(rejectedStatus.value).toBe(false);
    expect(rejectedStatus.isAccepted).toBe(false);
    expect(rejectedStatus.isRejected).toBe(true);
    expect(rejectedStatus.isPending).toBe(false);
  });

  it('should create an AcceptedStatus with pending status', () => {
    const pendingStatus = AcceptedStatus.create(null);
    expect(pendingStatus.value).toBeNull();
    expect(pendingStatus.isAccepted).toBe(false);
    expect(pendingStatus.isRejected).toBe(false);
    expect(pendingStatus.isPending).toBe(true);
  });

  it('should create and AcceptedStatus with accepted status using static methods', () => {
    const acceptedStatus = AcceptedStatus.accepted();
    expect(acceptedStatus.value).toBe(true);
    expect(acceptedStatus.isAccepted).toBe(true);
    expect(acceptedStatus.isRejected).toBe(false);
    expect(acceptedStatus.isPending).toBe(false);
  });

  it('should create and AcceptedStatus with rejected status using static methods', () => {
    const rejectedStatus = AcceptedStatus.rejected();
    expect(rejectedStatus.value).toBe(false);
    expect(rejectedStatus.isAccepted).toBe(false);
    expect(rejectedStatus.isRejected).toBe(true);
    expect(rejectedStatus.isPending).toBe(false);
  });
});
