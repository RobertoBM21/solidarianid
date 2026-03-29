import { UniqueEntityID } from '@app/shared/domain';
import { Community, UserIsNotAdminError } from './community.aggregate';
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
    it('should add a cause when requester is an admin', () => {
      const adminId = UniqueEntityID.create();
      const causeId = UniqueEntityID.create();
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

      const addCauseResult = community.addCause(causeId, adminId);
      expect(addCauseResult.isRight()).toBe(true);
    });

    it('should return an error when requester is not an admin', () => {
      const adminId = UniqueEntityID.create();
      const nonAdminId = UniqueEntityID.create();
      const causeId = UniqueEntityID.create();
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

      const addCauseResult = community.addCause(causeId, nonAdminId);

      expect(addCauseResult.isLeft()).toBe(true);
      if (addCauseResult.isLeft()) {
        const error = addCauseResult.value;
        expect(error).toBeInstanceOf(UserIsNotAdminError);
      }
    });
  });
});
