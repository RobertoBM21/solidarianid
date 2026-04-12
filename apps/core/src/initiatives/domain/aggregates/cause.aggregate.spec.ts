import { UniqueEntityID } from '@app/shared/domain';
import { CauseSupportRegisteredEvent } from '../events/cause-support-registered.event';
import { FundingActionCreatedEvent } from '../events/funding-action-created.event';
import { VolunteeringActionCreatedEvent } from '../events/volunteering-action-created.event';
import { InitiativeAlreadyClosedError } from '../value-objects/initiative-status.vo';
import { UserSupporter } from '../value-objects/supporter.vo';
import { FundingAction, VolunteeringAction } from './action.aggregate';
import { CauseAggr } from './cause.aggregate';

const makeCause = (closed = false) =>
  CauseAggr.create({
    id: '72fbbd7f-f2dc-43fb-8c28-550ea7f5e823',
    title: 'A random title',
    communityId: 'c6bfa3d6-3f4e-4c20-8d2e-4d2ff6b9d8c1',
    closed,
  }).value as CauseAggr;

describe('Cause Aggregate', () => {
  it('should create a cause with valid data', () => {
    const title = 'A random title';
    const result = CauseAggr.create({
      id: '72fbbd7f-f2dc-43fb-8c28-550ea7f5e823',
      title,
      communityId: 'c6bfa3d6-3f4e-4c20-8d2e-4d2ff6b9d8c1',
    });

    expect(result).toBeDefined();
    expect(result.isRight()).toBe(true);
    expect(result.value).toBeInstanceOf(CauseAggr);
    const cause = result.value as CauseAggr;
    expect(cause.title).toBe(title);
    expect(cause.closed).toBe(false);
  });

  it('should close an open cause', () => {
    const cause = CauseAggr.create({
      id: '72fbbd7f-f2dc-43fb-8c28-550ea7f5e823',
      title: 'A random title',
      communityId: 'c6bfa3d6-3f4e-4c20-8d2e-4d2ff6b9d8c1',
    }).value as CauseAggr;
    const result = cause.close();
    expect(result.isRight()).toBe(true);
    expect(cause.closed).toBe(true);
  });

  it('should not allow closing an already closed cause', () => {
    const cause = CauseAggr.create({
      id: '72fbbd7f-f2dc-43fb-8c28-550ea7f5e823',
      title: 'A random title',
      communityId: 'c6bfa3d6-3f4e-4c20-8d2e-4d2ff6b9d8c1',
      closed: true,
    }).value as CauseAggr;
    const result = cause.close();
    expect(result.isLeft()).toBe(true);
  });

  describe('registerSupport', () => {
    it('should register support and dispatch event', () => {
      const cause = makeCause();
      const supporter = UserSupporter.create(UniqueEntityID.create());

      const result = cause.registerSupport(supporter);

      expect(result.isRight()).toBe(true);
      const events = cause.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(CauseSupportRegisteredEvent);
      const event = events[0] as CauseSupportRegisteredEvent;
      expect(event.causeId).toBe(cause.id.toString());
      expect(event.supporterType).toBe('user');
      expect(event.supporterId).toBe(supporter.id.toString());
    });

    it('should not allow registering support on a closed cause', () => {
      const cause = makeCause(true);
      const supporter = UserSupporter.create(UniqueEntityID.create());

      const result = cause.registerSupport(supporter);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InitiativeAlreadyClosedError);
      expect(cause.pullDomainEvents()).toHaveLength(0);
    });
  });

  describe('createVolunteeringAction', () => {
    const validData = {
      title: 'Volunteering title',
      description: 'A valid description',
      objectives: ['Objective 1'],
      start: new Date('2026-05-01'),
      end: new Date('2026-06-01'),
    };

    it('should create a volunteering action and dispatch event', () => {
      const cause = makeCause();

      const result = cause.createVolunteeringAction(validData);

      expect(result.isRight()).toBe(true);
      expect(result.value).toBeInstanceOf(VolunteeringAction);
      const events = cause.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(VolunteeringActionCreatedEvent);
      const event = events[0] as VolunteeringActionCreatedEvent;
      expect(event.causeId).toBe(cause.id.toString());
      expect(event.title).toBe(validData.title);
    });

    it('should not allow creating a volunteering action on a closed cause', () => {
      const cause = makeCause(true);

      const result = cause.createVolunteeringAction(validData);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InitiativeAlreadyClosedError);
      expect(cause.pullDomainEvents()).toHaveLength(0);
    });
  });

  describe('createFundingAction', () => {
    const validData = {
      title: 'Funding title',
      description: 'A valid description',
      objectives: ['Objective 1'],
      targetAmount: 1000,
    };

    it('should create a funding action and dispatch event', () => {
      const cause = makeCause();

      const result = cause.createFundingAction(validData);

      expect(result.isRight()).toBe(true);
      expect(result.value).toBeInstanceOf(FundingAction);
      const events = cause.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(FundingActionCreatedEvent);
      const event = events[0] as FundingActionCreatedEvent;
      expect(event.causeId).toBe(cause.id.toString());
      expect(event.targetAmount).toBe(validData.targetAmount);
    });

    it('should not allow creating a funding action on a closed cause', () => {
      const cause = makeCause(true);

      const result = cause.createFundingAction(validData);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InitiativeAlreadyClosedError);
      expect(cause.pullDomainEvents()).toHaveLength(0);
    });
  });
});
