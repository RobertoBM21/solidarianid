import { GetMyCollaborationsQuery } from './get-my-collaborations.query';

describe('GetMyCollaborationsQuery', () => {
  it('should create an instance of GetMyCollaborationsQuery with the given userId', () => {
    const userId = 'user-123';
    const query = new GetMyCollaborationsQuery(userId);
    expect(query).toBeInstanceOf(GetMyCollaborationsQuery);
    expect(query.userId).toBe(userId);
  });
});
