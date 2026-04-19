import { UniqueEntityID } from '@app/shared/domain';
import { InvalidTitleError } from '@app/shared/domain/value-objects/title.vo';
import { VolunteeringAction } from './volunteering-action.aggregate';

const CAUSE_ID = UniqueEntityID.create().toString();

describe('VolunteeringAction Aggregate', () => {
  describe('create', () => {
    it('should create with valid data', () => {
      const result = VolunteeringAction.create({
        title: 'Beach Cleanup',
        causeId: CAUSE_ID,
      });

      expect(result.isRight()).toBe(true);
      const action = result.value as VolunteeringAction;
      expect(action.title).toBe('Beach Cleanup');
      expect(action.closed).toBe(false);
      expect(action.causeId.toString()).toBe(CAUSE_ID);
    });

    it('should create with closed flag', () => {
      const result = VolunteeringAction.create({
        title: 'Closed Activity',
        causeId: CAUSE_ID,
        closed: true,
      });

      expect(result.isRight()).toBe(true);
      const action = result.value as VolunteeringAction;
      expect(action.closed).toBe(true);
    });

    it('should fail with invalid title', () => {
      const result = VolunteeringAction.create({
        title: '',
        causeId: CAUSE_ID,
      });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidTitleError);
    });

    it('should preserve id when provided', () => {
      const id = UniqueEntityID.create().toString();
      const result = VolunteeringAction.create(
        { title: 'Title', causeId: CAUSE_ID },
        id,
      );

      expect(result.isRight()).toBe(true);
      const action = result.value as VolunteeringAction;
      expect(action.id.toString()).toBe(id);
    });
  });

  describe('close', () => {
    it('should close an open action', () => {
      const action = VolunteeringAction.create({
        title: 'Title',
        causeId: CAUSE_ID,
      }).value as VolunteeringAction;

      action.close();

      expect(action.closed).toBe(true);
    });

    it('should be idempotent on already closed action', () => {
      const action = VolunteeringAction.create({
        title: 'Title',
        causeId: CAUSE_ID,
        closed: true,
      }).value as VolunteeringAction;

      action.close();

      expect(action.closed).toBe(true);
    });
  });
});
