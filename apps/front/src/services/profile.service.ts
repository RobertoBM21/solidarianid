import type {
  HistoryItem,
  ProfileMembershipItem,
  ProfileProposal,
  ProfileView,
} from '../models/profile.models';

const COMMUNITY_1_ID = '11111111-1111-1111-1111-111111111111';
const COMMUNITY_2_ID = '22222222-2222-2222-2222-222222222222';
const COMMUNITY_3_ID = '33333333-3333-3333-3333-333333333333';

const USER_1_ID = '99999999-9999-9999-9999-999999999991';

const memberships: ProfileMembershipItem[] = [
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddd01',
    communityId: COMMUNITY_1_ID,
    communityName: 'Manos por la Educación',
    status: 'admin',
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddd02',
    communityId: COMMUNITY_3_ID,
    communityName: 'Voluntariado Verde',
    status: 'member',
  },
  {
    id: '88888888-8888-8888-8888-888888888881',
    communityId: COMMUNITY_2_ID,
    communityName: 'Red Salud Solidaria',
    status: 'pending',
  },
];

const proposals: ProfileProposal[] = [
  {
    id: 'aaaa9999-9999-9999-9999-999999999999',
    title: 'Comunidad de apoyo digital',
    status: 'pending',
  },
];

const profileView: ProfileView = {
  id: USER_1_ID,
  name: 'Ángel Pérez',
  email: 'angel.perez@solidarianid.test',
  phone: '600123123',
  city: 'Murcia',
  country: 'España',
  memberships,
  proposals,
};

const history: HistoryItem[] = [
  {
    type: 'support',
    subject: 'Apoyo registrado en Refuerzo escolar para primaria',
    causeId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    date: '2026-03-20T10:00:00.000Z',
  },
  {
    type: 'membership',
    subject: 'Alta en Manos por la Educación',
    date: '2026-03-24T10:00:00.000Z',
  },
  {
    type: 'volunteering',
    subject: 'Participación en Jornada de limpieza',
    causeId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    date: '2026-03-29T08:00:00.000Z',
    end: '2026-03-29T14:00:00.000Z',
  },
];

export async function getProfileView(): Promise<ProfileView> {
  return await Promise.resolve(profileView);
}

export async function getProfileHistory(): Promise<HistoryItem[]> {
  return await Promise.resolve(history);
}
