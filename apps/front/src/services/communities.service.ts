import type {
  CommunityDetail,
  CommunityListItem,
  CommunityMember,
  MembershipRequest,
} from '../models/community.models';

const COMMUNITY_1_ID = '11111111-1111-1111-1111-111111111111';
const COMMUNITY_2_ID = '22222222-2222-2222-2222-222222222222';
const COMMUNITY_3_ID = '33333333-3333-3333-3333-333333333333';
const COMMUNITY_4_ID = '44444444-4444-4444-4444-444444444444';
const COMMUNITY_5_ID = '55555555-5555-5555-5555-555555555555';

const CAUSE_1_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1';
const CAUSE_2_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2';
const CAUSE_3_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3';
const CAUSE_4_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4';

const communities: CommunityDetail[] = [
  {
    id: COMMUNITY_1_ID,
    name: 'Manos por la Educación',
    description:
      'Comunidad orientada a impulsar programas educativos para infancia en riesgo de exclusión.',
    createdAt: '2026-03-20T10:00:00.000Z',
    causes: [
      {
        id: CAUSE_1_ID,
        title: 'Refuerzo escolar para primaria',
        description:
          'Programa de apoyo semanal para menores con dificultades de aprendizaje en primaria.',
        duration: '6 meses',
        ods: 4,
        closed: false,
        createdAt: '2026-03-21T10:00:00.000Z',
      },
      {
        id: CAUSE_2_ID,
        title: 'Becas de comedor',
        description:
          'Financiación de ayudas para garantizar acceso a comedor escolar a menores vulnerables.',
        duration: '3 meses',
        ods: 2,
        closed: true,
        createdAt: '2026-03-22T10:00:00.000Z',
      },
    ],
  },
  {
    id: COMMUNITY_2_ID,
    name: 'Red Salud Solidaria',
    description:
      'Comunidad centrada en la recogida de recursos sanitarios y acompañamiento a pacientes.',
    createdAt: '2026-03-24T10:00:00.000Z',
    causes: [
      {
        id: CAUSE_3_ID,
        title: 'Kit de acompañamiento hospitalario',
        description:
          'Preparación y reparto de kits de higiene y apoyo para personas hospitalizadas.',
        duration: '4 meses',
        ods: 3,
        closed: false,
        createdAt: '2026-03-25T10:00:00.000Z',
      },
    ],
  },
  {
    id: COMMUNITY_3_ID,
    name: 'Voluntariado Verde',
    description:
      'Comunidad dedicada a acciones locales de limpieza, reciclaje y recuperación de espacios naturales.',
    createdAt: '2026-03-28T10:00:00.000Z',
    causes: [
      {
        id: CAUSE_4_ID,
        title: 'Recuperación de senderos naturales',
        description:
          'Acciones de limpieza y restauración de senderos y zonas verdes degradadas.',
        duration: '2 meses',
        ods: 15,
        closed: false,
        createdAt: '2026-03-29T10:00:00.000Z',
      },
    ],
  },
  {
    id: COMMUNITY_4_ID,
    name: 'Puentes de Integración',
    description:
      'Comunidad enfocada en apoyo a procesos de integración social y acompañamiento vecinal.',
    createdAt: '2026-04-01T10:00:00.000Z',
    causes: [],
  },
  {
    id: COMMUNITY_5_ID,
    name: 'Alimentos en Red',
    description:
      'Comunidad de apoyo a bancos de alimentos y reparto local para familias vulnerables.',
    createdAt: '2026-04-04T10:00:00.000Z',
    causes: [],
  },
];

const communityMembers: Record<string, CommunityMember[]> = {
  [COMMUNITY_1_ID]: [
    {
      id: '66666666-6666-6666-6666-666666666661',
      communityId: COMMUNITY_1_ID,
      userId: '77777777-7777-7777-7777-777777777771',
      role: 'admin',
    },
    {
      id: '66666666-6666-6666-6666-666666666662',
      communityId: COMMUNITY_1_ID,
      userId: '77777777-7777-7777-7777-777777777772',
      role: 'member',
    },
    {
      id: '66666666-6666-6666-6666-666666666663',
      communityId: COMMUNITY_1_ID,
      userId: '77777777-7777-7777-7777-777777777773',
      role: 'member',
    },
  ],
  [COMMUNITY_2_ID]: [
    {
      id: '66666666-6666-6666-6666-666666666664',
      communityId: COMMUNITY_2_ID,
      userId: '77777777-7777-7777-7777-777777777774',
      role: 'admin',
    },
    {
      id: '66666666-6666-6666-6666-666666666665',
      communityId: COMMUNITY_2_ID,
      userId: '77777777-7777-7777-7777-777777777775',
      role: 'member',
    },
  ],
  [COMMUNITY_3_ID]: [
    {
      id: '66666666-6666-6666-6666-666666666666',
      communityId: COMMUNITY_3_ID,
      userId: '77777777-7777-7777-7777-777777777776',
      role: 'admin',
    },
    {
      id: '66666666-6666-6666-6666-666666666667',
      communityId: COMMUNITY_3_ID,
      userId: '77777777-7777-7777-7777-777777777777',
      role: 'member',
    },
  ],
  [COMMUNITY_4_ID]: [
    {
      id: '66666666-6666-6666-6666-666666666668',
      communityId: COMMUNITY_4_ID,
      userId: '77777777-7777-7777-7777-777777777778',
      role: 'admin',
    },
  ],
  [COMMUNITY_5_ID]: [
    {
      id: '66666666-6666-6666-6666-666666666669',
      communityId: COMMUNITY_5_ID,
      userId: '77777777-7777-7777-7777-777777777779',
      role: 'admin',
    },
  ],
};

const membershipRequests: MembershipRequest[] = [
  {
    id: '88888888-8888-8888-8888-888888888881',
    userId: '99999999-9999-9999-9999-999999999991',
    communityId: COMMUNITY_2_ID,
    status: 'pending',
    createdAt: '2026-04-05T10:00:00.000Z',
  },
];

export async function getCommunities(): Promise<CommunityListItem[]> {
  return await Promise.resolve(
    communities.map((community) => ({
      id: community.id,
      name: community.name,
      description: community.description,
      createdAt: community.createdAt,
    })),
  );
}

export async function getLatestCommunities(): Promise<CommunityListItem[]> {
  return await Promise.resolve(
    communities
      .map((community) => ({
        id: community.id,
        name: community.name,
        description: community.description,
        createdAt: community.createdAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
  );
}

export async function getCommunityById(
  id: string,
): Promise<CommunityDetail | undefined> {
  return await Promise.resolve(
    communities.find((community) => community.id === id),
  );
}

export async function getCommunityMembers(
  communityId: string,
): Promise<CommunityMember[]> {
  return await Promise.resolve(communityMembers[communityId] ?? []);
}

export async function getMembershipRequests(): Promise<MembershipRequest[]> {
  return await Promise.resolve(membershipRequests);
}
