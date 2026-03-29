import {
  ActionSchedule,
  EndBeforeStartError,
  InvalidActionScheduleError,
} from './action-schedule.vo';

describe('ActionSchedule VO', () => {
  it('should create a valid schedule', () => {
    const start = new Date('2025-01-01T10:00:00Z');
    const end = new Date('2025-01-01T12:00:00Z');

    const result = ActionSchedule.create({ start, end });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.start).toEqual(start);
      expect(result.value.end).toEqual(end);
    }
  });

  it('should fail when dates are invalid', () => {
    const result = ActionSchedule.create({
      start: 'not-valid',
      end: 'not-valid',
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidActionScheduleError);
    }
  });

  it('should fail when end is before start', () => {
    const start = new Date('2025-01-02T10:00:00Z');
    const end = new Date('2025-01-01T10:00:00Z');

    const result = ActionSchedule.create({ start, end });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(EndBeforeStartError);
    }
  });
});
