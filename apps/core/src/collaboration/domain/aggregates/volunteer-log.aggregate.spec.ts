import { UniqueEntityID } from '@app/shared/domain';
import { InvalidVolunteeringDateError } from '@app/shared/domain/value-objects/volunteering-date.vo';
import {
  CancellationTooLateError,
  InvalidDateRangeError,
  VolunteerLog,
  VolunteerLogNotOwnedError,
} from './volunteer-log.aggregate';

describe('VolunteerLog Aggregate', () => {
  const volunteerId = UniqueEntityID.create().toString();
  const actionId = UniqueEntityID.create().toString();
  const startDate = new Date('2026-01-01T10:00:00Z');
  const endDate = new Date('2026-01-01T12:00:00Z');

  describe('create', () => {
    it('should create a valid volunteer log', () => {
      const result = VolunteerLog.create({
        volunteerId: volunteerId,
        volunteeringActionId: actionId,
        start: startDate,
        end: endDate,
      });

      expect(result.isRight()).toBe(true);
      const log = result.value as VolunteerLog;
      expect(log.volunteerId).toBe(volunteerId);
      expect(log.volunteeringActionId).toBe(actionId);
      expect(log.start).toEqual(startDate);
      expect(log.end).toEqual(endDate);
    });

    it('should fail if start date is after end date', () => {
      const result = VolunteerLog.create({
        volunteerId: volunteerId,
        volunteeringActionId: actionId,
        start: endDate,
        end: startDate,
      });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidDateRangeError);
    });

    it('should fail if start date is equal to end date', () => {
      const result = VolunteerLog.create({
        volunteerId: volunteerId,
        volunteeringActionId: actionId,
        start: startDate,
        end: startDate,
      });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidDateRangeError);
    });

    it('should fail if start date is invalid', () => {
      const result = VolunteerLog.create({
        volunteerId: volunteerId,
        volunteeringActionId: actionId,
        start: new Date('invalid'),
        end: endDate,
      });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidVolunteeringDateError);
    });

    it('should fail if end date is invalid', () => {
      const result = VolunteerLog.create({
        volunteerId: volunteerId,
        volunteeringActionId: actionId,
        start: startDate,
        end: new Date('invalid'),
      });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidVolunteeringDateError);
    });
  });

  describe('canCancel', () => {
    it('should allow cancellation if current date is before start date', () => {
      const futureStart = new Date(Date.now() + 100000); // 100 seconds in future
      const futureEnd = new Date(Date.now() + 200000);

      const logOrError = VolunteerLog.create({
        volunteerId: volunteerId,
        volunteeringActionId: actionId,
        start: futureStart,
        end: futureEnd,
      });

      expect(logOrError.isRight()).toBe(true);
      const log = logOrError.value as VolunteerLog;

      const result = log.canCancel(volunteerId);
      expect(result.isRight()).toBe(true);
    });

    it('should fail if current date is after start date', () => {
      const pastStart = new Date(Date.now() - 200000);
      const pastEnd = new Date(Date.now() - 100000);

      const logOrError = VolunteerLog.create({
        volunteerId: volunteerId,
        volunteeringActionId: actionId,
        start: pastStart,
        end: pastEnd,
      });

      expect(logOrError.isRight()).toBe(true);
      const log = logOrError.value as VolunteerLog;

      const result = log.canCancel(volunteerId);
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(CancellationTooLateError);
    });

    it('should fail if the user is not the owner', () => {
      const log = VolunteerLog.create({
        volunteerId: volunteerId,
        volunteeringActionId: actionId,
        start: startDate,
        end: endDate,
      }).value as VolunteerLog;

      const otherUserId = UniqueEntityID.create().toString();
      const result = log.canCancel(otherUserId);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(VolunteerLogNotOwnedError);
    });
  });
});
