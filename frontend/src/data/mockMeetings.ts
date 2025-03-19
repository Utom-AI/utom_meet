import { FileText, List, Paperclip } from 'react-feather';

export interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  host: {
    name: string;
    avatar: string;
  };
  description: string;
  agenda: string[];
  isExpanded?: boolean;
}

export const upcomingMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Q4 Product Strategy Review',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    date: '2024-02-15',
    host: {
      name: 'Sarah Chen',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=4A9163&color=fff'
    },
    description: 'Comprehensive review of Q4 product strategy, including market analysis, competitor insights, and proposed feature roadmap. We will discuss key metrics, customer feedback, and prioritize initiatives for the upcoming quarter.',
    agenda: [
      'Review of Q3 performance metrics',
      'Market analysis and competitive landscape',
      'Product roadmap discussion',
      'Resource allocation and timeline planning',
      'Action items and next steps'
    ]
  },
  {
    id: '2',
    title: 'Design System Workshop',
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    date: '2024-02-16',
    host: {
      name: 'Michael Park',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Park&background=367C4F&color=fff'
    },
    description: 'Interactive workshop focused on establishing our new design system. We will align on component libraries, design tokens, and documentation standards to ensure consistency across all product interfaces.',
    agenda: [
      'Design principles overview',
      'Component library review',
      'Design tokens standardization',
      'Documentation framework',
      'Implementation timeline'
    ]
  },
  {
    id: '3',
    title: 'User Research Findings',
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    date: '2024-02-17',
    host: {
      name: 'Emma Rodriguez',
      avatar: 'https://ui-avatars.com/api/?name=Emma+Rodriguez&background=4A9163&color=fff'
    },
    description: 'Presentation of recent user research findings from our latest feature release. We will discuss user feedback, pain points identified, and proposed solutions based on the research data.',
    agenda: [
      'Research methodology overview',
      'Key findings presentation',
      'User feedback analysis',
      'Recommendations and solutions',
      'Discussion and next steps'
    ]
  },
  {
    id: '4',
    title: 'Sprint Planning Session',
    startTime: '9:30 AM',
    endTime: '11:00 AM',
    date: '2024-02-18',
    host: {
      name: 'Alex Thompson',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Thompson&background=367C4F&color=fff'
    },
    description: 'Sprint planning meeting to define objectives and deliverables for the upcoming two-week sprint. We will prioritize backlog items and assign tasks to team members.',
    agenda: [
      'Sprint goals definition',
      'Backlog refinement',
      'Task estimation and assignment',
      'Risk assessment',
      'Team capacity planning'
    ]
  }
];

export const previousMeetings: Meeting[] = [
  {
    id: '5',
    title: 'UI/UX Review Session',
    startTime: '1:00 PM',
    endTime: '2:30 PM',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    host: {
      name: 'David Kim',
      avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=4A9163&color=fff'
    },
    description: 'Review of the latest UI/UX changes implemented in the product. Discussion of user feedback and potential improvements for the next iteration.',
    agenda: [
      'UI changes overview',
      'User feedback analysis',
      'Improvement proposals',
      'Implementation timeline',
      'Next steps'
    ]
  },
  {
    id: '6',
    title: 'Team Retrospective',
    startTime: '3:00 PM',
    endTime: '4:30 PM',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    host: {
      name: 'Lisa Wang',
      avatar: 'https://ui-avatars.com/api/?name=Lisa+Wang&background=367C4F&color=fff'
    },
    description: 'Monthly team retrospective to discuss what went well, what could be improved, and action items for the next month.',
    agenda: [
      'Previous month review',
      'Team achievements',
      'Areas for improvement',
      'Action items',
      'Team building activities'
    ]
  },
  {
    id: '7',
    title: 'Product Demo',
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    host: {
      name: 'James Wilson',
      avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=4A9163&color=fff'
    },
    description: 'Demonstration of new product features to stakeholders. Overview of implemented functionality and gathering feedback for future improvements.',
    agenda: [
      'Feature showcase',
      'Technical implementation details',
      'Performance metrics',
      'Stakeholder feedback',
      'Next development phase'
    ]
  },
  {
    id: '8',
    title: 'Architecture Review',
    startTime: '2:00 PM',
    endTime: '3:30 PM',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    host: {
      name: 'Rachel Martinez',
      avatar: 'https://ui-avatars.com/api/?name=Rachel+Martinez&background=367C4F&color=fff'
    },
    description: 'Technical review of the system architecture. Discussion of scalability, performance optimizations, and upcoming technical challenges.',
    agenda: [
      'Architecture overview',
      'Performance analysis',
      'Scalability planning',
      'Technical debt review',
      'Implementation roadmap'
    ]
  }
]; 