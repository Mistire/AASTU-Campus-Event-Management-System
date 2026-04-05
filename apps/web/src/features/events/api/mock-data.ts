import { Event } from './useEvents';

const MOCK_SPEAKERS = {
  dr_abebe: {
    id: "s-1",
    fullName: "Dr. Abebe Kebede",
    title: "Head of AI Research, AASTU",
    bio: "Pioneer in NLP and distributed systems with over 15 years of experience in regional tech innovation.",
    profileImage: "https://i.pravatar.cc/150?u=abebe"
  },
  ms_selam: {
    id: "s-2",
    fullName: "Ms. Selam Tesfaye",
    title: "Senior Product Designer",
    bio: "Expert in user-centric design and campus experience optimization.",
    profileImage: "https://i.pravatar.cc/150?u=selam"
  },
  mr_dawit: {
    id: "s-3",
    fullName: "Mr. Dawit Isaac",
    title: "Venture Capital Analyst",
    bio: "Focusing on early-stage tech startups in the East African ecosystem.",
    profileImage: "https://i.pravatar.cc/150?u=dawit"
  },
  prof_tsegaye: {
    id: "s-4",
    fullName: "Prof. Tsegaye Ararso",
    title: "Ethics & Philosophy Professor",
    bio: "Specializing in the intersection of traditional ethics and modern digital transformation.",
    profileImage: "https://i.pravatar.cc/150?u=tsegaye"
  },
  coach_yonas: {
    id: "s-5",
    fullName: "Coach Yonas Mekuria",
    title: "AASTU Athletics Director",
    bio: "Former national athlete now leading the next generation of campus sports stars.",
    profileImage: "https://i.pravatar.cc/150?u=yonas"
  }
};

export const MOCK_EVENTS: Event[] = [
  {
    id: "mock-1",
    title: "AI & Future Frontiers Masterclass",
    description: "An intensive deep-dive into Large Language Models and their practical applications in campus automation. Join AASTU's top researchers for a hands-on session that will redefine how you think about intelligence. This masterclass covers the transition from basic automation to agentic AI workflows, focusing on how students can leverage open-source models for local problems.",
    startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 2 + 14400000).toISOString(),
    capacity: 200,
    requiresApproval: false,
    status: { id: "status-approved", statusName: "APPROVED" },
    eventType: { id: "type-workshop", name: "Workshop" },
    venue: { id: "venue-red", name: "Red Carpet Hall", location: "Main Campus, Block 54" },
    tags: [
        { id: "tag-1", tagId: "t-ai", tag: { id: "t-ai", name: "Artificial Intelligence" } },
        { id: "tag-2", tagId: "t-dev", tag: { id: "t-dev", name: "Software Development" } }
    ],
    eventCategories: [
        { id: "cat-1", categoryId: "c-tech", category: { id: "c-tech", name: "Technology", description: "Innovation and Engineering" } }
    ],
    sessions: [
      {
        id: "sess-1-1",
        title: "Introduction to LLM Architecture",
        description: "Understanding transformers and how GPT models process campus data.",
        startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 2 + 3600000).toISOString(),
        location: "Main Stage",
        sessionType: "KEYNOTE",
        speakers: [{ id: "rel-1", speaker: MOCK_SPEAKERS.dr_abebe }]
      },
      {
        id: "sess-1-2",
        title: "Building Your First Campus Bot",
        description: "Hands-on tutorial using Python and LangChain to automate registration queries.",
        startTime: new Date(Date.now() + 86400000 * 2 + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 2 + 10800000).toISOString(),
        location: "Lab A",
        sessionType: "WORKSHOP",
        speakers: [{ id: "rel-2", speaker: MOCK_SPEAKERS.dr_abebe }]
      }
    ],
    _count: { registrations: 142 },
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mock-2",
    title: "Campus Nightlife: Nexus Festival",
    description: "The ultimate gathering of talent, music, and campus culture. Experience the Nexus at the AASTU Amphitheater. Food, vibes, and unforgettable connections await. The Nexus Festival brings together artists from across the city for a 5-hour showcase of creativity.",
    startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 5 + 18000000).toISOString(),
    capacity: 1500,
    requiresApproval: false,
    status: { id: "status-approved", statusName: "APPROVED" },
    eventType: { id: "type-festival", name: "Festival" },
    venue: { id: "venue-amp", name: "AASTU Amphitheater", location: "Central Quad" },
    tags: [
        { id: "tag-3", tagId: "t-music", tag: { id: "t-music", name: "Music" } },
        { id: "tag-4", tagId: "t-social", tag: { id: "t-social", name: "Social" } }
    ],
    eventCategories: [
        { id: "cat-2", categoryId: "c-social", category: { id: "c-social", name: "Social & Fun", description: "Vibrant campus social life" } }
    ],
    sessions: [
      {
        id: "sess-2-1",
        title: "Opening Ceremony",
        description: "Official kickoff with lightning and sound show.",
        startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 5 + 3600000).toISOString(),
        location: "Main Stage",
        sessionType: "OTHER",
        speakers: []
      },
      {
        id: "sess-2-2",
        title: "Modern Beats Showcase",
        description: "Electronic and traditional fusion performance.",
        startTime: new Date(Date.now() + 86400000 * 5 + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 5 + 18000000).toISOString(),
        location: "Amphitheater",
        sessionType: "OTHER",
        speakers: []
      }
    ],
    _count: { registrations: 856 },
    thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mock-3",
    title: "Entrepreneurship & Pitch Perfect",
    description: "Do you have the next big idea? Learn how to pitch to investors, build a business model, and launch your startup right here on campus. Winning pitches get mentorship seats with local incubators. This session includes a 'Shark Tank' style presentation round.",
    startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 3 + 10800000).toISOString(),
    capacity: 100,
    requiresApproval: true,
    status: { id: "status-approved", statusName: "APPROVED" },
    eventType: { id: "type-seminar", name: "Seminar" },
    venue: { id: "venue-conf", name: "Business Center Conference Room", location: "Admin Block" },
    tags: [
        { id: "tag-5", tagId: "t-startup", tag: { id: "t-startup", name: "Startup" } },
        { id: "tag-6", tagId: "t-business", tag: { id: "t-business", name: "Business" } }
    ],
    eventCategories: [
        { id: "cat-3", categoryId: "c-career", category: { id: "c-career", name: "Career & Growth", description: "Professional development paths" } }
    ],
    sessions: [
      {
        id: "sess-3-1",
        title: "The Art of the Pitch",
        description: "Mastering the 3-minute elevator pitch to grab attention.",
        startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 3 + 3600000).toISOString(),
        location: "Boardroom",
        sessionType: "KEYNOTE",
        speakers: [{ id: "rel-5", speaker: MOCK_SPEAKERS.mr_dawit }]
      },
      {
        id: "sess-3-2",
        title: "Live Pitching Round",
        description: "10 selected students present their ideas to the panel.",
        startTime: new Date(Date.now() + 86400000 * 3 + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 3 + 10800000).toISOString(),
        location: "Main Hall",
        sessionType: "PANEL",
        speakers: [
          { id: "rel-6", speaker: MOCK_SPEAKERS.mr_dawit },
          { id: "rel-7", speaker: MOCK_SPEAKERS.ms_selam }
        ]
      }
    ],
    _count: { registrations: 68 },
    thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mock-4",
    title: "The Great Debate: Ethics in AI",
    description: "Join the Philosophers' Circle for a spirited debate on the ethical implications of artificial intelligence in education. Is AI a tool for growth or a threat to academic integrity? This session features diverse viewpoints from faculty and guest experts in digital policy.",
    startTime: new Date(Date.now() + 86400000 * 1).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 1 + 10800000).toISOString(),
    capacity: 300,
    requiresApproval: false,
    status: { id: "status-approved", statusName: "APPROVED" },
    eventType: { id: "type-discussion", name: "Discussion" },
    venue: { id: "venue-lib", name: "Library Auditorium", location: "Main Library 4th Floor" },
    tags: [
        { id: "tag-7", tagId: "t-ethics", tag: { id: "t-ethics", name: "Ethics" } },
        { id: "tag-8", tagId: "t-ai-meta", tag: { id: "t-ai-meta", name: "Philosophy" } }
    ],
    eventCategories: [
        { id: "cat-4", categoryId: "c-academic", category: { id: "c-academic", name: "Academic", description: "Scholarly pursuits and research" } }
    ],
    sessions: [
      {
        id: "sess-4-1",
        title: "Moral Algorithms: A Historical Perspective",
        description: "How machine logic intersects with human values.",
        startTime: new Date(Date.now() + 86400000 * 1).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 1 + 3600000).toISOString(),
        location: "Auditorium",
        sessionType: "KEYNOTE",
        speakers: [{ id: "rel-8", speaker: MOCK_SPEAKERS.prof_tsegaye }]
      },
      {
        id: "sess-4-2",
        title: "Open Debate: Automation vs Integrity",
        description: "A fast-paced debate between students and technical leaders.",
        startTime: new Date(Date.now() + 86400000 * 1 + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 1 + 9000000).toISOString(),
        location: "Debate Hall",
        sessionType: "DISCUSSION",
        speakers: [{ id: "rel-9", speaker: MOCK_SPEAKERS.prof_tsegaye }]
      }
    ],
    _count: { registrations: 120 },
    thumbnail: "https://images.unsplash.com/photo-1507146482234-59c2993390a6?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mock-5",
    title: "AASTU Sports Championships: Semi-Finals",
    description: "The roar of the crowd, the thrill of the win! Don't miss out on the local football championships. Support your department and cheer for the home team. This championship gathers the top 4 teams from across all engineering disciplines in a winner-takes-all tournament.",
    startTime: new Date(Date.now() + 86400000 * 4).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 4 + 14400000).toISOString(),
    capacity: 2000,
    requiresApproval: false,
    status: { id: "status-approved", statusName: "APPROVED" },
    eventType: { id: "type-sports", name: "Sports" },
    venue: { id: "venue-pitch", name: "Main Sports Pitch", location: "Sports Complex" },
    tags: [
        { id: "tag-9", tagId: "t-football", tag: { id: "t-football", name: "Football" } },
        { id: "tag-10", tagId: "t-fitness", tag: { id: "t-fitness", name: "Athletics" } }
    ],
    eventCategories: [
        { id: "cat-5", categoryId: "c-sports", category: { id: "c-sports", name: "Sports & Fit", description: "Health and competition" } }
    ],
    sessions: [
      {
        id: "sess-5-1",
        title: "Match 1: ICT vs Electrical",
        description: "The first semi-final showdown.",
        startTime: new Date(Date.now() + 86400000 * 4).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 4 + 7200000).toISOString(),
        location: "Main Pitch",
        sessionType: "GAME",
        speakers: [{ id: "rel-10", speaker: MOCK_SPEAKERS.coach_yonas }]
      },
      {
        id: "sess-5-2",
        title: "Match 2: Mining vs Architecture",
        description: "The second semi-final showdown.",
        startTime: new Date(Date.now() + 86400000 * 4 + 7200000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 4 + 14400000).toISOString(),
        location: "Main Pitch",
        sessionType: "GAME",
        speakers: [{ id: "rel-11", speaker: MOCK_SPEAKERS.coach_yonas }]
      }
    ],
    _count: { registrations: 450 },
    thumbnail: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mock-6",
    title: "Photography Workshop: Golden Hour",
    description: "Master the art of lighting and composition. Join us for a practical outing around the campus landmarks to capture the perfect golden hour shot. Whether you use a DSLRs or a smartphone, this session will help you unlock your creative eye.",
    startTime: new Date(Date.now() + 86400000 * 6).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 6 + 10800000).toISOString(),
    capacity: 40,
    requiresApproval: false,
    status: { id: "status-approved", statusName: "APPROVED" },
    eventType: { id: "type-workshop", name: "Workshop" },
    venue: { id: "venue-garden", name: "Central Gardens", location: "Beside Library" },
    tags: [
        { id: "tag-11", tagId: "t-photo", tag: { id: "t-photo", name: "Photography" } },
        { id: "tag-12", tagId: "t-art", tag: { id: "t-art", name: "Art" } }
    ],
    eventCategories: [
        { id: "cat-6", categoryId: "c-arts", category: { id: "c-arts", name: "Arts & Music", description: "Exhibitions, Concerts & Creative" } }
    ],
    sessions: [
      {
        id: "sess-6-1",
        title: "Light & Composition Theory",
        description: "Understanding the golden ratio and sun placement.",
        startTime: new Date(Date.now() + 86400000 * 6).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 6 + 3600000).toISOString(),
        location: "Lobby Hall",
        sessionType: "SEMINAR",
        speakers: [{ id: "rel-12", speaker: MOCK_SPEAKERS.ms_selam }]
      },
      {
        id: "sess-6-2",
        title: "Field Outing: Campus Views",
        description: "Practical shooting session around the clocktower.",
        startTime: new Date(Date.now() + 86400000 * 6 + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 6 + 10800000).toISOString(),
        location: "Outdoors",
        sessionType: "PRACTICE",
        speakers: [{ id: "rel-13", speaker: MOCK_SPEAKERS.ms_selam }]
      }
    ],
    _count: { registrations: 28 },
    thumbnail: "https://images.unsplash.com/photo-1452784444945-3f422708fe5e?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mock-7",
    title: "HackAASTU: 24-Hour Innovation Sprint",
    description: "Code, create, and compete! Team up with fellow developers to solve real-world problems. Prizes, pizza, and endless caffeine provided. This hackathon focuses on sustainable development goals through software innovation.",
    startTime: new Date(Date.now() + 86400000 * 10).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 10 + 86400000).toISOString(),
    capacity: 250,
    requiresApproval: true,
    status: { id: "status-approved", statusName: "APPROVED" },
    eventType: { id: "type-hackathon", name: "Hackathon" },
    venue: { id: "venue-lab", name: "Advanced Computing Lab", location: "ICT Block" },
    tags: [
        { id: "tag-13", tagId: "t-code", tag: { id: "t-code", name: "Coding" } },
        { id: "tag-14", tagId: "t-hack", tag: { id: "t-hack", name: "Hackathon" } }
    ],
    eventCategories: [
        { id: "cat-1", categoryId: "c-tech", category: { id: "c-tech", name: "Technology", description: "Innovation and Engineering" } }
    ],
    sessions: [
      {
        id: "sess-7-1",
        title: "Hacking Begins",
        description: "Prompt release and team formation finalize.",
        startTime: new Date(Date.now() + 86400000 * 10).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 10 + 3600000).toISOString(),
        location: "Main Hall",
        sessionType: "OTHER",
        speakers: [{ id: "rel-14", speaker: MOCK_SPEAKERS.dr_abebe }]
      },
      {
        id: "sess-7-2",
        title: "Mid-Night Pitch Check",
        description: "Status update with mentors.",
        startTime: new Date(Date.now() + 86400000 * 10 + 43200000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 10 + 46800000).toISOString(),
        location: "Meeting Pods",
        sessionType: "MENTORSHIP",
        speakers: [{ id: "rel-15", speaker: MOCK_SPEAKERS.mr_dawit }]
      }
    ],
    _count: { registrations: 180 },
    thumbnail: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mock-8",
    title: "Zen & Flow: Campus Yoga",
    description: "Find your balance and de-stress before finals. A gentle yoga session open to all levels. Bring a mat and a positive mindset. The session includes breathing exercises, gentle flow, and a long relaxation period.",
    startTime: new Date(Date.now() + 86400000 * 2.5).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 2.5 + 3600000).toISOString(),
    capacity: 60,
    requiresApproval: false,
    status: { id: "status-approved", statusName: "APPROVED" },
    eventType: { id: "type-class", name: "Class" },
    venue: { id: "venue-gym", name: "Indoor Gym Hall", location: "Student Center" },
    tags: [
        { id: "tag-15", tagId: "t-yoga", tag: { id: "t-yoga", name: "Yoga" } },
        { id: "tag-16", tagId: "t-wellness", tag: { id: "t-wellness", name: "Wellness" } }
    ],
    eventCategories: [
        { id: "cat-5", categoryId: "c-sports", category: { id: "c-sports", name: "Sports & Fit", description: "Health and competition" } }
    ],
    sessions: [
      {
        id: "sess-8-1",
        title: "Mindful Awakening",
        description: "Deep breathing and sun salutations.",
        startTime: new Date(Date.now() + 86400000 * 2.5).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 2.5 + 3600000).toISOString(),
        location: "Gym Hall",
        sessionType: "PRACTICE",
        speakers: [{ id: "rel-16", speaker: MOCK_SPEAKERS.ms_selam }]
      }
    ],
    _count: { registrations: 42 },
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"
  }
];

export const MOCK_CATEGORIES = [
  { id: "c-tech", name: "Technology", description: "Innovation, Coding & Engineering" },
  { id: "c-social", name: "Social & Fun", description: "Parties, Festivals & Meetups" },
  { id: "c-career", name: "Career", description: "Jobs, Internships & Networking" },
  { id: "c-academic", name: "Academic", description: "Seminars, Research & Workshops" },
  { id: "c-sports", name: "Sports & Fit", description: "Tournaments, Fitness & Athletics" },
  { id: "c-arts", name: "Arts & Music", description: "Exhibitions, Concerts & Creative" },
];

export const MOCK_RECOMMENDATIONS = MOCK_EVENTS.slice(0, 3);
