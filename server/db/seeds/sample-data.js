/**
 * Sample Resume Data
 * Realistic mock data for development and testing
 */

export const sampleResume = {
  resume: {
    title: 'Software Engineer Resume',
    template: 'classic',
    accent_color: '#3B82F6',
  },

  personalInfo: {
    name: 'John Doe',
    role: 'Senior Full-Stack Developer',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin_url: 'https://linkedin.com/in/johndoe',
    portfolio_url: 'https://johndoe.dev',
  },

  summary: {
    content:
      'Experienced Full-Stack Developer with 6+ years of expertise in building scalable web applications. Proficient in React, Node.js, and cloud technologies. Proven track record of delivering high-quality software solutions and leading technical teams.',
  },

  experiences: [
    {
      company: 'Tech Corp',
      role: 'Senior Full-Stack Developer',
      location: 'San Francisco, CA',
      start_date: '2021-03-01',
      end_date: null,
      is_current: true,
      description:
        'Led development of microservices architecture serving 1M+ users. Built React dashboard reducing load times by 40%. Mentored team of 5 junior developers. Implemented CI/CD pipelines with GitHub Actions.',
      order_index: 0,
    },
    {
      company: 'StartupXYZ',
      role: 'Full-Stack Developer',
      location: 'Remote',
      start_date: '2019-06-01',
      end_date: '2021-02-28',
      is_current: false,
      description:
        'Developed RESTful APIs using Node.js and Express. Implemented CI/CD pipelines with GitHub Actions. Built responsive UI components with React and TypeScript. Optimized database queries reducing response time by 50%.',
      order_index: 1,
    },
    {
      company: 'WebAgency Inc',
      role: 'Junior Developer',
      location: 'New York, NY',
      start_date: '2018-01-01',
      end_date: '2019-05-31',
      is_current: false,
      description:
        'Created custom WordPress themes and plugins. Collaborated with designers to implement pixel-perfect UIs. Maintained multiple client websites. Learned fundamentals of web development and best practices.',
      order_index: 2,
    },
  ],

  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      location: 'Berkeley, CA',
      graduation_date: '2017-05-15',
      gpa: '3.8',
      description:
        'Relevant coursework: Data Structures, Algorithms, Web Development, Machine Learning, Database Systems, Software Engineering.',
      order_index: 0,
    },
  ],

  projects: [
    {
      name: 'E-commerce Platform',
      description:
        'Built full-stack marketplace with Next.js, Stripe payments, and real-time inventory management. Deployed on Vercel with PostgreSQL database. Features include user authentication, product search, cart management, and order tracking.',
      technologies: ['Next.js', 'React', 'PostgreSQL', 'Stripe', 'Tailwind CSS', 'Vercel'],
      url: 'https://github.com/johndoe/ecommerce',
      date: '2023-06-01',
      order_index: 0,
    },
    {
      name: 'Task Management App',
      description:
        'Collaborative task manager with real-time updates using WebSockets. Features include drag-and-drop, team collaboration, file attachments, and analytics dashboard. Handles 10k+ concurrent users.',
      technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Redux', 'Docker'],
      url: 'https://github.com/johndoe/taskapp',
      date: '2022-12-01',
      order_index: 1,
    },
    {
      name: 'Weather Dashboard',
      description:
        'Real-time weather application with geolocation support and 7-day forecasts. Integrated with OpenWeatherMap API. Features responsive design and data visualization with charts.',
      technologies: ['React', 'TypeScript', 'Chart.js', 'Weather API', 'CSS Modules'],
      url: 'https://github.com/johndoe/weather',
      date: '2022-08-01',
      order_index: 2,
    },
  ],

  skills: [
    { name: 'JavaScript', category: 'Languages', order_index: 0 },
    { name: 'TypeScript', category: 'Languages', order_index: 1 },
    { name: 'Python', category: 'Languages', order_index: 2 },
    { name: 'SQL', category: 'Languages', order_index: 3 },
    { name: 'React', category: 'Frontend', order_index: 4 },
    { name: 'Next.js', category: 'Frontend', order_index: 5 },
    { name: 'Tailwind CSS', category: 'Frontend', order_index: 6 },
    { name: 'HTML/CSS', category: 'Frontend', order_index: 7 },
    { name: 'Node.js', category: 'Backend', order_index: 8 },
    { name: 'Express', category: 'Backend', order_index: 9 },
    { name: 'RESTful APIs', category: 'Backend', order_index: 10 },
    { name: 'PostgreSQL', category: 'Database', order_index: 11 },
    { name: 'MongoDB', category: 'Database', order_index: 12 },
    { name: 'Redis', category: 'Database', order_index: 13 },
    { name: 'Docker', category: 'DevOps', order_index: 14 },
    { name: 'AWS', category: 'DevOps', order_index: 15 },
    { name: 'CI/CD', category: 'DevOps', order_index: 16 },
    { name: 'Git', category: 'Tools', order_index: 17 },
    { name: 'GitHub Actions', category: 'Tools', order_index: 18 },
    { name: 'Agile/Scrum', category: 'Soft Skills', order_index: 19 },
  ],
};

