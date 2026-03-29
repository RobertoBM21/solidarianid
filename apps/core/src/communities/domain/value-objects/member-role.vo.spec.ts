import { MemberRole } from './member-role.vo';

describe('MemberRole Value Object', () => {
  it('should create an admin MemberRole', () => {
    const adminRole = MemberRole.admin();

    expect(adminRole.isAdmin()).toBe(true);
    expect(adminRole.isMember()).toBe(false);
    expect(adminRole.asBoolean()).toBe(true);
  });

  it('should create a member MemberRole', () => {
    const memberRole = MemberRole.member();

    expect(memberRole.isAdmin()).toBe(false);
    expect(memberRole.isMember()).toBe(true);
    expect(memberRole.asBoolean()).toBe(false);
  });

  it('should create a MemberRole from true boolean value', () => {
    const adminRole = MemberRole.create(true);

    expect(adminRole.isAdmin()).toBe(true);
    expect(adminRole.isMember()).toBe(false);
    expect(adminRole.asBoolean()).toBe(true);
  });

  it('should create a MemberRole from false boolean value', () => {
    const memberRole = MemberRole.create(false);

    expect(memberRole.isAdmin()).toBe(false);
    expect(memberRole.isMember()).toBe(true);
    expect(memberRole.asBoolean()).toBe(false);
  });

  it('should return correct enum value for admin role', () => {
    const adminRole = MemberRole.admin();

    expect(adminRole.asEnum()).toBe('admin');
  });

  it('should return correct enum value for member role', () => {
    const memberRole = MemberRole.member();

    expect(memberRole.asEnum()).toBe('member');
  });
});
