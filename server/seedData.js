export const INITIAL_SKILLS = [
  { name: 'Python', category: 'Programming', icon: 'Code' },
  { name: 'Machine Learning', category: 'Data & AI', icon: 'Brain' },
  { name: 'UI/UX Design', category: 'Design', icon: 'Palette' },
  { name: 'Graphic Design', category: 'Design', icon: 'PenTool' },
  { name: 'React', category: 'Programming', icon: 'Layout' },
  { name: 'Web Development', category: 'Programming', icon: 'Globe' },
  { name: 'Data Science', category: 'Data & AI', icon: 'BarChart' },
  { name: 'Excel', category: 'Business & Tools', icon: 'FileSpreadsheet' },
  { name: 'Java', category: 'Programming', icon: 'Coffee' },
  { name: 'C Programming', category: 'Programming', icon: 'Cpu' }
];

export const INITIAL_USERS = [
  {
    id: 'user_alex',
    name: 'Alex Chen',
    email: 'alex.chen@campus.edu',
    password: 'password123',
    college: 'Pacific Tech Institute',
    major: 'Computer Science',
    year: 'Sophomore',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'CS sophomore building algorithmic tools and deep learning pipelines. Passionate about Python, PyTorch, and automation. Looking to learn Figma and modern UI/UX design to build beautiful products!',
    teachSkills: [
      { name: 'Python', level: 'Advanced', experience: '3 years, open source contributor' },
      { name: 'Machine Learning', level: 'Intermediate', experience: 'Built CNNs & classification models' }
    ],
    learnSkills: [
      { name: 'UI/UX Design', targetLevel: 'Intermediate', reason: 'Want to design my own SaaS web apps' }
    ],
    rating: 4.9,
    reviewCount: 14,
    availability: 'Mon & Wed after 4 PM, Sat 10 AM - 2 PM',
    createdAt: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'user_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.j@campus.edu',
    password: 'password123',
    college: 'School of Arts & Design',
    major: 'Human-Computer Interaction',
    year: 'Junior',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    bio: 'HCI junior obsessed with design systems, wireframing, and user empathy. Fluent in Figma and Illustrator. Need someone patient to teach me Python for automating design tokens and data analysis.',
    teachSkills: [
      { name: 'UI/UX Design', level: 'Expert', experience: 'Figma pro, 2 campus design internships' },
      { name: 'Graphic Design', level: 'Advanced', experience: 'Branding, vector illustration, Adobe Suite' }
    ],
    learnSkills: [
      { name: 'Python', targetLevel: 'Beginner', reason: 'Automate scripts and process design data' }
    ],
    rating: 5.0,
    reviewCount: 18,
    availability: 'Tue & Thu 2 PM - 6 PM, Sunday mornings',
    createdAt: '2026-09-05T14:30:00.000Z'
  },
  {
    id: 'user_marcus',
    name: 'Marcus Rivera',
    email: 'marcus.r@campus.edu',
    password: 'password123',
    college: 'College of Engineering',
    major: 'Software Engineering',
    year: 'Senior',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'Full-stack builder who loves React 18, Next.js, and snappy interactive interfaces. Currently diving into big data and want to exchange React frontend mentorship for practical Data Science guidance.',
    teachSkills: [
      { name: 'React', level: 'Expert', experience: 'Built 10+ web apps, modern state management' },
      { name: 'Web Development', level: 'Advanced', experience: 'HTML5, CSS, responsive layouts, REST APIs' }
    ],
    learnSkills: [
      { name: 'Data Science', targetLevel: 'Intermediate', reason: 'Analyze web traffic and user behavior datasets' }
    ],
    rating: 4.8,
    reviewCount: 22,
    availability: 'Weekdays 5 PM - 8 PM',
    createdAt: '2026-08-20T09:15:00.000Z'
  },
  {
    id: 'user_priya',
    name: 'Priya Sharma',
    email: 'priya.s@campus.edu',
    password: 'password123',
    college: 'Business & Information Systems',
    major: 'Business Analytics',
    year: 'Junior',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    bio: 'Analytics enthusiast specialized in data cleaning, predictive modeling with Pandas, and advanced Excel formulas/VBA macros. Looking for someone to guide me through Java object-oriented principles.',
    teachSkills: [
      { name: 'Data Science', level: 'Advanced', experience: 'Pandas, Scikit-learn, statistical analysis' },
      { name: 'Excel', level: 'Expert', experience: 'VBA, Pivot Tables, financial modeling' }
    ],
    learnSkills: [
      { name: 'Java', targetLevel: 'Beginner', reason: 'Preparing for technical coursework and AP credit' }
    ],
    rating: 4.9,
    reviewCount: 19,
    availability: 'Mon, Wed, Fri 1 PM - 5 PM',
    createdAt: '2026-09-02T11:00:00.000Z'
  },
  {
    id: 'user_david',
    name: 'David Kim',
    email: 'david.k@campus.edu',
    password: 'password123',
    college: 'Department of Electrical & Computer Eng',
    major: 'Computer Engineering',
    year: 'Senior',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'Low-level systems and embedded programmer. Thorough understanding of C pointers, memory management, and Java OOP architecture. Excited to learn modern Web Development to showcase my robotics hardware on a web dashboard.',
    teachSkills: [
      { name: 'Java', level: 'Expert', experience: 'Enterprise Java, multi-threading, Spring Boot' },
      { name: 'C Programming', level: 'Advanced', experience: 'Pointers, OS kernels, embedded microcontrollers' }
    ],
    learnSkills: [
      { name: 'Web Development', targetLevel: 'Intermediate', reason: 'Build a browser dashboard for my IoT senior capstone' }
    ],
    rating: 4.7,
    reviewCount: 15,
    availability: 'Tue & Thu evenings, Saturday all day',
    createdAt: '2026-08-25T16:45:00.000Z'
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    email: 'elena.r@campus.edu',
    password: 'password123',
    college: 'School of Arts & Architecture',
    major: 'Digital Media Arts',
    year: 'Sophomore',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    bio: 'Visual artist and digital illustrator. I teach visual branding, color theory, and logo design in Illustrator and Photoshop. Passionate about learning Machine Learning concepts for generative art!',
    teachSkills: [
      { name: 'Graphic Design', level: 'Expert', experience: 'Poster design, typography, brand identities' },
      { name: 'UI/UX Design', level: 'Intermediate', experience: 'Wireframing, landing page designs' }
    ],
    learnSkills: [
      { name: 'Machine Learning', targetLevel: 'Beginner', reason: 'Curious about latent space diffusion and AI art' }
    ],
    rating: 4.9,
    reviewCount: 11,
    availability: 'Flexible evenings, Sunday afternoons',
    createdAt: '2026-09-10T12:00:00.000Z'
  }
];

export const INITIAL_SWAPS = [
  {
    id: 'swap_101',
    senderId: 'user_david',
    receiverId: 'user_marcus',
    offeredSkill: 'Java',
    requestedSkill: 'Web Development',
    message: 'Hey Marcus! Saw you want to learn Java. I have 4 years of experience and need to build a web dashboard for my IoT project. Want to swap?',
    status: 'accepted',
    createdAt: '2026-10-01T14:20:00.000Z'
  },
  {
    id: 'swap_102',
    senderId: 'user_priya',
    receiverId: 'user_david',
    offeredSkill: 'Data Science',
    requestedSkill: 'Java',
    message: 'Hi David! I can walk you through data analysis pipelines and statistical forecasting if you can help me master Java OOP classes.',
    status: 'pending',
    createdAt: '2026-10-02T16:40:00.000Z'
  }
];

export const INITIAL_SESSIONS = [
  {
    id: 'session_201',
    swapRequestId: 'swap_101',
    teacherId: 'user_marcus',
    learnerId: 'user_david',
    skill: 'Web Development',
    scheduledTime: '2026-10-05T17:00:00.000Z',
    durationMinutes: 60,
    locationOrLink: 'Campus Library, Study Pod 3B',
    status: 'scheduled',
    notes: 'Covering semantic HTML, CSS Flexbox & CSS Grid fundamentals for the IoT dashboard.'
  },
  {
    id: 'session_202',
    swapRequestId: 'swap_historical_1',
    teacherId: 'user_sarah',
    learnerId: 'user_alex',
    skill: 'UI/UX Design',
    scheduledTime: '2026-09-28T15:00:00.000Z',
    durationMinutes: 90,
    locationOrLink: 'Figma Jam Room / Google Meet',
    status: 'completed',
    notes: 'Walked through Figma auto-layout, wireframes, and design token best practices.'
  }
];

export const INITIAL_REVIEWS = [
  {
    id: 'rev_301',
    sessionId: 'session_202',
    reviewerId: 'user_alex',
    revieweeId: 'user_sarah',
    rating: 5,
    feedback: 'Sarah was an exceptional mentor! She broke down Figma auto-layout and components so clearly. My app wireframes look 10x better already. Highly recommend swapping skills with her!',
    createdAt: '2026-09-28T17:00:00.000Z'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    userId: 'user_alex',
    type: 'review_received',
    title: 'New 5-Star Review Received!',
    message: 'Sarah Jenkins left you a glowing 5-star review for your Python mentoring session.',
    read: false,
    createdAt: '2026-09-29T10:00:00.000Z'
  },
  {
    id: 'notif_2',
    userId: 'user_marcus',
    type: 'request_accepted',
    title: 'Swap Request Accepted',
    message: 'David Kim accepted your swap proposal: Java for Web Development.',
    read: true,
    createdAt: '2026-10-01T15:00:00.000Z'
  },
  {
    id: 'notif_3',
    userId: 'user_david',
    type: 'request_received',
    title: 'New Swap Proposal',
    message: 'Priya Sharma proposed a skill swap: Data Science for Java.',
    read: false,
    createdAt: '2026-10-02T16:41:00.000Z'
  }
];
