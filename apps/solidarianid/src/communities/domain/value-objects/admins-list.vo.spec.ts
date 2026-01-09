import { UniqueEntityID } from '@app/shared/domain';
import { AdminsList, InvalidAdminsListError } from './admins-list.vo';

describe('AdminsList Value Object', () => {
  it('should create an AdminsList with valid UniqueEntityIDs', () => {
    const adminId1 = UniqueEntityID.create();
    const adminId2 = UniqueEntityID.create();
    const result = AdminsList.create([adminId1, adminId2]);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const adminsList = result.value;
      expect(adminsList.value).toHaveLength(2);
      expect(adminsList.has(adminId1)).toBe(true);
      expect(adminsList.has(adminId2)).toBe(true);
    }
  });

  it('should return an error for duplicate admin IDs', () => {
    const adminId = UniqueEntityID.create();
    const result = AdminsList.create([adminId, adminId]);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      const error = result.value;
      expect(error).toBeInstanceOf(InvalidAdminsListError);
    }
  });

  it('should return an error for empty admin list', () => {
    const result = AdminsList.create([]);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      const error = result.value;
      expect(error).toBeInstanceOf(InvalidAdminsListError);
      expect(error.message).toBe('A community must have at least one admin.');
    }
  });
});
