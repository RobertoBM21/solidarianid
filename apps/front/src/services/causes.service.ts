import type { CauseDetail } from '../models/cause.models';

const CAUSE_1_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1';
const CAUSE_2_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2';
const CAUSE_3_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3';
const CAUSE_4_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4';

const COMMUNITY_1_ID = '11111111-1111-1111-1111-111111111111';
const COMMUNITY_2_ID = '22222222-2222-2222-2222-222222222222';
const COMMUNITY_3_ID = '33333333-3333-3333-3333-333333333333';

const causes: CauseDetail[] = [
  {
    id: CAUSE_1_ID,
    communityId: COMMUNITY_1_ID,
    communityName: 'Manos por la Educación',
    title: 'Refuerzo escolar para primaria',
    description:
      'Programa de apoyo semanal para menores con dificultades de aprendizaje en primaria.',
    duration: '6 meses',
    ods: 4,
    closed: false,
    supportedByUser: true,
    actions: [
      {
        id: 'aaaa1111-1111-1111-1111-111111111111',
        causeId: CAUSE_1_ID,
        type: 'volunteering',
        title: 'Tutoría presencial',
        description: 'Sesiones de refuerzo educativo dos tardes por semana.',
        objectives: ['Acompañar al alumnado', 'Reforzar lectura y matemáticas'],
        closed: false,
        createdAt: '2026-03-23T10:00:00.000Z',
        start: '2026-04-10T16:00:00.000Z',
        end: '2026-04-10T18:00:00.000Z',
      },
      {
        id: 'aaaa1111-1111-1111-1111-111111111112',
        causeId: CAUSE_1_ID,
        type: 'funding',
        title: 'Recogida de material escolar',
        description:
          'Campaña para financiar mochilas, cuadernos y libros de apoyo.',
        objectives: ['Cubrir material básico', 'Asegurar continuidad escolar'],
        closed: false,
        createdAt: '2026-03-24T10:00:00.000Z',
        targetAmount: 1200,
        currentAmount: 450,
      },
    ],
  },
  {
    id: CAUSE_2_ID,
    communityId: COMMUNITY_1_ID,
    communityName: 'Manos por la Educación',
    title: 'Becas de comedor',
    description:
      'Financiación de ayudas para garantizar acceso a comedor escolar a menores vulnerables.',
    duration: '3 meses',
    ods: 2,
    closed: true,
    supportedByUser: false,
    actions: [
      {
        id: 'aaaa1111-1111-1111-1111-111111111113',
        causeId: CAUSE_2_ID,
        type: 'funding',
        title: 'Campaña de becas de comedor',
        description: 'Captación de fondos para ayudas de comedor escolar.',
        objectives: ['Garantizar acceso al comedor'],
        closed: true,
        createdAt: '2026-03-26T10:00:00.000Z',
        targetAmount: 3000,
        currentAmount: 3000,
      },
    ],
  },
  {
    id: CAUSE_3_ID,
    communityId: COMMUNITY_2_ID,
    communityName: 'Red Salud Solidaria',
    title: 'Kit de acompañamiento hospitalario',
    description:
      'Preparación y reparto de kits de higiene y apoyo para personas hospitalizadas.',
    duration: '4 meses',
    ods: 3,
    closed: false,
    supportedByUser: false,
    actions: [
      {
        id: 'aaaa1111-1111-1111-1111-111111111114',
        causeId: CAUSE_3_ID,
        type: 'volunteering',
        title: 'Montaje de kits',
        description:
          'Clasificación y empaquetado de material de primera necesidad.',
        objectives: ['Preparar kits', 'Organizar reparto'],
        closed: false,
        createdAt: '2026-03-27T10:00:00.000Z',
        start: '2026-04-12T09:00:00.000Z',
        end: '2026-04-12T13:00:00.000Z',
      },
    ],
  },
  {
    id: CAUSE_4_ID,
    communityId: COMMUNITY_3_ID,
    communityName: 'Voluntariado Verde',
    title: 'Recuperación de senderos naturales',
    description:
      'Acciones de limpieza y restauración de senderos y zonas verdes degradadas.',
    duration: '2 meses',
    ods: 15,
    closed: false,
    supportedByUser: false,
    actions: [
      {
        id: 'aaaa1111-1111-1111-1111-111111111115',
        causeId: CAUSE_4_ID,
        type: 'volunteering',
        title: 'Jornada de limpieza',
        description:
          'Recogida de residuos y señalización de puntos de reciclaje.',
        objectives: ['Limpiar senderos', 'Mejorar señalización'],
        closed: false,
        createdAt: '2026-03-30T10:00:00.000Z',
        start: '2026-04-20T08:00:00.000Z',
        end: '2026-04-20T14:00:00.000Z',
      },
    ],
  },
];

export async function getCauseById(
  id: string,
): Promise<CauseDetail | undefined> {
  return await Promise.resolve(causes.find((cause) => cause.id === id));
}

export async function getCausesByCommunityId(
  communityId: string,
): Promise<CauseDetail[]> {
  return await Promise.resolve(
    causes.filter((cause) => cause.communityId === communityId),
  );
}
