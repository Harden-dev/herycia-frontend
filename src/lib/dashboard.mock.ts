export const dashboardMetrics = [
  {
    label: "RDV aujourd'hui",
    value: '12',
    trend: 'up' as const,
    trendValue: '3',
    iconKey: 'calendar' as const,
    accent: 'primary' as const,
  },
  {
    label: "File d'attente",
    value: '5',
    trend: 'down' as const,
    trendValue: '2',
    iconKey: 'users' as const,
    accent: 'warning' as const,
  },
  {
    label: 'Clients actifs',
    value: '248',
    trend: 'up' as const,
    trendValue: '12',
    iconKey: 'userCheck' as const,
    accent: 'accent' as const,
  },
  {
    label: 'Revenus du jour',
    value: '42 500 F',
    trend: 'up' as const,
    trendValue: '18%',
    iconKey: 'cash' as const,
    accent: 'success' as const,
  },
]

export const clientsEvolutionData = {
  month: [
    { label: 'Jan', value: 18 },
    { label: 'Fév', value: 22 },
    { label: 'Mar', value: 28 },
    { label: 'Avr', value: 24 },
    { label: 'Mai', value: 32 },
    { label: 'Juin', value: 35 },
    { label: 'Juil', value: 30 },
    { label: 'Aoû', value: 38 },
    { label: 'Sep', value: 42 },
    { label: 'Oct', value: 45 },
    { label: 'Nov', value: 48 },
    { label: 'Déc', value: 52 },
  ],
  year: [
    { label: '2022', value: 120 },
    { label: '2023', value: 168 },
    { label: '2024', value: 210 },
    { label: '2025', value: 248 },
    { label: '2026', value: 62 },
  ],
}

export const revenueEvolutionData = {
  day: [
    { label: 'Lun', value: 32000 },
    { label: 'Mar', value: 28000 },
    { label: 'Mer', value: 35000 },
    { label: 'Jeu', value: 41000 },
    { label: 'Ven', value: 52000 },
    { label: 'Sam', value: 68000 },
    { label: 'Dim', value: 42500 },
  ],
  week: [
    { label: 'S1', value: 185000 },
    { label: 'S2', value: 210000 },
    { label: 'S3', value: 198000 },
    { label: 'S4', value: 245000 },
  ],
  month: [
    { label: 'Jan', value: 820000 },
    { label: 'Fév', value: 910000 },
    { label: 'Mar', value: 1050000 },
    { label: 'Avr', value: 980000 },
    { label: 'Mai', value: 1120000 },
    { label: 'Juin', value: 1180000 },
  ],
  year: [
    { label: '2022', value: 8_200_000 },
    { label: '2023', value: 10_400_000 },
    { label: '2024', value: 12_800_000 },
    { label: '2025', value: 14_200_000 },
    { label: '2026', value: 3_100_000 },
  ],
}

export const queueWaitingMock = [
  { id: 1, position: 1, name: 'Koffi Atta', service: 'Coupe homme', wait_minutes: 12 },
  { id: 2, position: 2, name: 'Awa Diallo', service: 'Tresse', wait_minutes: 25 },
  { id: 3, position: 3, name: 'Mariam Kouassi', service: 'Coloration', wait_minutes: 38 },
  { id: 4, position: 4, name: 'Jean-Baptiste N.', service: 'Barbe', wait_minutes: 45 },
  { id: 5, position: 5, name: 'Fatou Traoré', service: 'Brushing', wait_minutes: 52 },
]

export type ActivityLogType = 'appointment' | 'payment' | 'client' | 'queue' | 'system'

export const activityLogsMock = [
  {
    id: 1,
    type: 'appointment' as ActivityLogType,
    message: 'RDV confirmé — Koffi Atta · Coupe homme à 10h00',
    time: 'Il y a 5 min',
  },
  {
    id: 2,
    type: 'payment' as ActivityLogType,
    message: 'Paiement reçu — 8 500 F · Orange Money',
    time: 'Il y a 18 min',
  },
  {
    id: 3,
    type: 'queue' as ActivityLogType,
    message: "Awa Diallo ajoutée à la file d'attente",
    time: 'Il y a 32 min',
  },
  {
    id: 4,
    type: 'client' as ActivityLogType,
    message: 'Nouveau client — Fatou Traoré',
    time: 'Il y a 1 h',
  },
  {
    id: 5,
    type: 'appointment' as ActivityLogType,
    message: 'Rappel WhatsApp envoyé — Mariam Kouassi',
    time: 'Il y a 1 h 15',
  },
  {
    id: 6,
    type: 'system' as ActivityLogType,
    message: '3 coiffeurs connectés sur la file live',
    time: 'Il y a 2 h',
  },
]
