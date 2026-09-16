export interface WorkflowHighlight {
  id: string;
  tag: string;
  quote: string;
  author: string;
  role: string;
  metric?: string;
}

export const AUTH_BANNER_HIGHLIGHTS: WorkflowHighlight[] = [
  {
    id: 'kanban-workflow',
    tag: 'Visual Workflow Management',
    quote:
      'Transform chaotic backlogs into clear, high-velocity workflows. Move tasks from To-Do to Done with zero friction.',
    author: 'TaskFlow Core',
    role: 'Kanban & Sprint Engine',
    metric: '3x Faster Delivery',
  },
  {
    id: 'team-alignment',
    tag: 'Real-time Team Sync',
    quote:
      'Align cross-functional teams instantly. Assign clear ownership, track dependencies, and unblock work before deadlines slip.',
    author: 'Agile Workspace',
    role: 'Collaborative Task Tracking',
    metric: '100% Milestone Clarity',
  },
  {
    id: 'progress-insights',
    tag: 'Intelligent Progress Insights',
    quote:
      'Gain deep visibility across all active sprints. Spot velocity trends and deliver every milestone with absolute predictability.',
    author: 'Analytics Suite',
    role: 'Sprint Velocity & Reports',
    metric: '99.4% On-time Completion',
  },
];

export const AUTH_BANNER_CONFIG = {
  autoPlayIntervalMs: 4000,
  defaultImageSrc: '/authbackground.jpg',
  defaultImageAlt: 'TaskFlow Kanban board workflow illustration',
} as const;
