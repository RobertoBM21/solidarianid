import { UniqueEntityID } from '@app/shared/domain';
import { Community, UserIsNotAdminError } from './community.aggregate';
import { Cause } from './entities/cause.entity';
import { CauseClosedEvent } from './events/cause-closed.event';
import { CauseCreatedEvent } from './events/cause-created.event';
import { InvalidAdminsListError } from './value-objects/admins-list.vo';

describe('Community Aggregate', () => {
  it('should create a Community with valid properties', () => {
    const adminId = UniqueEntityID.create();
    const data = {
      name: 'Test Community',
      description: 'This is a test community',
      admins: [adminId.toString()],
    };

    const result = Community.create(data);

    expect(result.isRight()).toBe(true);
    if (result.isLeft()) {
      return;
    }
    const community = result.value;
    expect(community.name).toBe(data.name);
    expect(community.description).toBe(data.description);
    expect(community.admins.has(adminId)).toBe(true);
  });

  it('should fail to create a community with no admins', () => {
    const data = {
      name: 'Test Community',
      description: 'This is a test community',
      admins: [],
    };

    const result = Community.create(data);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidAdminsListError);
  });

  describe('addCause', () => {
    const validCauseProps = {
      title: 'Test Cause',
      description: 'This is a test cause',
      duration: '1 month',
      ods: 1,
      closed: false,
      createdAt: new Date(),
    };

    it('should add a cause when requester is an admin', () => {
      const adminId = UniqueEntityID.create();
      const data = {
        name: 'Test Community',
        description: 'This is a test community',
        admins: [adminId.toString()],
      };

      const communityResult = Community.create(data);

      expect(communityResult.isRight()).toBe(true);
      if (communityResult.isLeft()) {
        return;
      }
      const community = communityResult.value;

      const addCauseResult = community.addCause(validCauseProps, adminId);
      expect(addCauseResult.isRight()).toBe(true);
      const cause = addCauseResult.value as Cause;
      expect(cause).toBeInstanceOf(Cause);

      expect(community.causes).toHaveLength(1);
      expect(community.causes[0]).toBe(cause);

      const events = community.pullDomainEvents();
      expect(events.length).toBe(1);
      expect(events[0].constructor).toBe(CauseCreatedEvent);

      const event = events[0] as CauseCreatedEvent;
      expect(event.causeId).toBe(cause.id.toString());
      expect(event.causeTitle).toBe(cause.title);
      expect(event.communityId).toBe(community.id.toString());
    });

    it('should return an error when requester is not an admin', () => {
      const adminId = UniqueEntityID.create();
      const nonAdminId = UniqueEntityID.create();
      const data = {
        name: 'Test Community',
        description: 'This is a test community',
        admins: [adminId.toString()],
      };
      const communityResult = Community.create(data);
      expect(communityResult.isRight()).toBe(true);
      if (communityResult.isLeft()) {
        return;
      }
      const community = communityResult.value;

      const addCauseResult = community.addCause(validCauseProps, nonAdminId);

      expect(addCauseResult.isLeft()).toBe(true);
      if (addCauseResult.isLeft()) {
        const error = addCauseResult.value;
        expect(error).toBeInstanceOf(UserIsNotAdminError);
      }
      const events = community.pullDomainEvents();
      expect(events.length).toBe(0);
    });
  });

  describe('closeCause', () => {
    it('should close a cause when requester is an admin', () => {
      const adminId = UniqueEntityID.create();
      const causeId = UniqueEntityID.create();
      const data = {
        name: 'Test Community',
        description: 'This is a test community',
        admins: [adminId.toString()],
        causes: [
          Cause.create(
            {
              title: 'Test Cause',
              description: 'This is a test cause',
              duration: '1 month',
              ods: 1,
              closed: false,
              createdAt: new Date(),
            },
            causeId.toString(),
          ).value as Cause,
        ],
      };
      const community = Community.create(data).value as Community;
      expect(community).toBeInstanceOf(Community);

      const closeResult = community.closeCause(causeId, adminId);
      expect(closeResult.isRight()).toBe(true);

      const cause = community.causes[0];
      expect(cause.closed).toBe(true);

      const events = community.pullDomainEvents();
      expect(events.length).toBe(1);
      expect(events[0].constructor).toBe(CauseClosedEvent);
    });

    it('should return an error when requester is not an admin', () => {
      const adminId = UniqueEntityID.create();
      const nonAdminId = UniqueEntityID.create();
      const causeId = UniqueEntityID.create();
      const data = {
        name: 'Test Community',
        description: 'This is a test community',
        admins: [adminId.toString()],
        causes: [
          Cause.create(
            {
              title: 'Test Cause',
              description: 'This is a test cause',
              duration: '1 month',
              ods: 1,
              closed: false,
              createdAt: new Date(),
            },
            causeId.toString(),
          ).value as Cause,
        ],
      };
      const community = Community.create(data).value as Community;
      expect(community).toBeInstanceOf(Community);

      const closeResult = community.closeCause(causeId, nonAdminId);
      expect(closeResult.isLeft()).toBe(true);
      expect(closeResult.value).toBeInstanceOf(UserIsNotAdminError);

      const events = community.pullDomainEvents();
      expect(events.length).toBe(0);
    });
  });
});
