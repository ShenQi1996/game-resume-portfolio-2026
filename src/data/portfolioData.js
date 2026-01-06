export const portfolioData = {
  hero: {
    name: "She Qi",
    title: "Full Stack Software Engineer",
    tagline: "Building and scaling web applications"
  },
  
  // Story-driven section texts for the game world
  sectionTexts: {
    intro: "Hi ! I am Sam Qi, the superhero of a paper kingdom, flying over rooftops and forests while the sky tears open with smoke and embers. In this world, chaos spreads like a bad deployment, and I am the one who fixes it before it destroys everything.",
    about: "I do not fight with a sword. I fight with calm focus and clean execution. When the dragon shows up, it does not just burn villages, it breaks systems, scrambles truth, and turns simple paths into traps. My job is to bring order back and protect the people who cannot protect themselves.",
    skills: "My powers look like tools to most people, but in the kingdom they are spells. Python and Django let me forge strong foundations. React lets me shape fast clean screens that do not confuse the villagers. REST and GraphQL let me connect distant towns that stopped trusting each other. SQL tuning lets me open blocked roads and remove bottlenecks. Agile discipline keeps my mission moving when everything feels urgent.",
    experience: "I learned to lead under pressure at iPacket, where I ran multiple missions at the same time, kept scope and deliverables aligned, built project plans with milestones and dependencies, watched risk before it exploded, and kept everyone informed so the kingdom did not fall into panic. I also tightened Jira and Atlassian workflows so the team could see clearly and move faster.\n\nBefore that in Brooklyn at BHMedWear, I built SQL tracking systems to protect accuracy, helped launch a Shopify internal platform to improve operations, and used Google Analytics to measure what worked and what failed. Those were my early hero trials.",
    projects: "In the game, my work becomes artifacts I carry into battle. The Tracking Ledger exposes hidden errors before they spread. The Merchant Portal speeds up the town so supplies arrive in time. The Visibility Beacon reveals the dragons weak points by showing what is missing, what is slow, and what is about to break. When the princess cries for help, these are the tools that let me reach her before the fire does.",
    education: "My origin is Computer Science at SUNY University at Buffalo, and I am leveling up with a Master of Science in Information Technology at Florida Institute of Technology, expected March 2026. That is why I keep getting stronger each chapter."
  },
  
  about: {
    text: "Full stack software engineer focused on building and scaling web applications. Hands on experience with Python and Django, React, REST and GraphQL APIs, and SQL Server performance tuning. Strong in agile delivery, debugging, observability, and regulated data workflows. Master of Science in Information Technology in progress, expected March 2026."
  },
  
  skills: {
    categories: [
      {
        name: "Languages",
        items: ["C++", "Java", "HTML5", "CSS/SCSS", "JavaScript", "Python3", "React", "Redux", "Ruby", "Ruby on Rails", "Mongoose", "Node.js", "Express.js", "jQuery"]
      },
      {
        name: "Database",
        items: ["MySQL", "MongoDB", "SQLite3", "PostgreSQL", "SQL Server"]
      },
      {
        name: "Technologies & Tools",
        items: ["Git", "AWS", "Google Analytics", "Github", "Bitbucket", "Heroku", "Webpack", "Firebase", "Docker", "Multipass", "Docker Swarm", "Kubernetes", "Linux"]
      },
      {
        name: "Project Management",
        items: ["Jira", "Trello", "Asana", "Agile", "Scrum", "Sprint Planning", "Backlog Grooming", "Retrospectives"]
      }
    ]
  },
  
  experience: [
    {
      company: "iPacket",
      role: "Web Application Developer",
      period: "Aug 2022 – Present",
      location: "Parkersburg, WV",
      description: "Led multiple concurrent technical programs, ensuring scope, objectives, and deliverables were met in alignment with strategic goals. Collaborated with engineering, product management, and cross-functional teams to design and execute high-impact SaaS and integration solutions.",
      achievements: [
        "Created and maintained detailed project plans, including milestones, dependencies, and resource allocations",
        "Monitored program progress, proactively identifying risks and developing mitigation strategies to avoid delays",
        "Facilitated transparent communication across teams and stakeholders, providing regular updates to leadership",
        "Optimized Jira workflows and Atlassian tool configurations to improve visibility, reporting, and team efficiency",
        "Applied Agile/Scrum practices including sprint planning, backlog grooming, and retrospectives to drive on-time delivery"
      ]
    },
    {
      company: "BHMedWear",
      role: "Web Developer / Product Data Coordinator",
      period: "May 2017 – May 2019",
      location: "Brooklyn, NY",
      description: "Developed and maintained SQL-based tracking systems to ensure data accuracy and compliance. Worked with leadership to launch a Shopify-based internal platform, improving operational workflows.",
      achievements: [
        "Used Google Analytics to assess site performance, support decision-making, and improve conversion rates",
        "Produced regular operational and compliance reports to aid strategic planning"
      ]
    }
  ],
  
  projects: [
    {
      title: "Interactive Portfolio",
      description: "A game-style portfolio built with React and PixiJS featuring platformer mechanics and smooth animations.",
      tech: ["React", "PixiJS", "SCSS", "JavaScript"],
      links: {
        live: "https://example.com",
        github: "https://github.com/example"
      }
    },
    {
      title: "Healthcare Web Applications",
      description: "Full-stack healthcare applications built with Python, Django, React, and SQL Server, focusing on performance tuning and regulated data workflows.",
      tech: ["Python", "Django", "React", "SQL Server", "REST API", "GraphQL"],
      links: {
        live: "https://example.com",
        github: "https://github.com/example"
      }
    },
    {
      title: "SaaS Integration Solutions",
      description: "High-impact SaaS and integration solutions designed and executed in collaboration with cross-functional teams.",
      tech: ["React", "Node.js", "AWS", "Docker", "Kubernetes"],
      links: {
        live: "https://example.com",
        github: "https://github.com/example"
      }
    }
  ],
  
  education: [
    {
      institution: "Florida Institute of Technology",
      degree: "Master of Science in Information Technology",
      period: "Expected March 2026",
      location: "Melbourne, FL",
      description: "Currently pursuing Master's degree in Information Technology."
    },
    {
      institution: "SUNY, University at Buffalo",
      degree: "Bachelor of Science in Computer Science",
      period: "Graduated",
      location: "Buffalo, NY",
      description: "Focused on software engineering, algorithms, and web technologies."
    }
  ],
  
  contact: {
    email: "Qisam1989@gmail.com",
    phone: "(347) 757-7730",
    location: "Brooklyn, New York",
    socials: {
      github: "https://github.com/ShenQi1996",
      linkedin: "https://www.linkedin.com/in/shenqi1993"
    },
    resumePdfUrl: "/resume.pdf"
  },
  
  theme: {
    colors: {
      primary: "#4A90E2",
      secondary: "#50C878",
      accent: "#FF6B6B",
      background: "#1A1A2E",
      surface: "#16213E",
      text: "#FFFFFF",
      textSecondary: "#B0B0B0"
    },
    tileColors: {
      ground: "#2D5A3D",
      platform: "#4A7C59",
      sign: "#E8B923",
      marker: "#FF6B6B"
    }
  },
  
  sections: [
    { id: "beginning", name: "Beginning", x: 50, bgColor: 0x87CEEB }, // Early morning - light blue
    { id: "intro", name: "Introduction", x: 450, bgColor: 0xFFE5B4 }, // Morning - soft yellow
    { id: "about", name: "About", x: 850, bgColor: 0xFFD700 }, // Late morning - golden yellow
    { id: "skills", name: "Skills", x: 1250, bgColor: 0xFFA500 }, // Mid-morning - bright orange
    { id: "experience", name: "Experience", x: 1650, bgColor: 0xFF8C00 }, // Noon - deep orange
    { id: "projects", name: "Projects", x: 2050, bgColor: 0xFF6B35 }, // Afternoon - orange-red
    { id: "education", name: "Education", x: 2450, bgColor: 0xFF4500 }, // Late afternoon - red-orange
    { id: "contact", name: "Contact", x: 2850, bgColor: 0x0D1B2A } // Midnight - dark night blue
  ],
  
  // Superhero images configuration
  // To add more images: 
  // 1. Place image files in /public/images/superheroes/
  // 2. Add entries to this array with unique 'id' and 'imagePath'
  // 3. The system will randomly select from available images
  // 4. Players can switch between heroes by touching the left wall
  superheroImages: [
    {
      id: 'superhero-1',
      imagePath: '/images/superheroes/papercraft_style_f.png',
      heightAboveGround: 200,
      offsetXSpeed: 2,
      offsetYSpeed: 1.5,
      scale: 0.15 // Red cap superhero - bigger size
    },
    {
      id: 'superhero-2',
      imagePath: '/images/superheroes/paper_hero_pose_blue_up.png',
      heightAboveGround: 200,
      offsetXSpeed: 2,
      offsetYSpeed: 1.5,
      scale: 0.26 // Normalized to match red cap size (486x394) - reduced
    },
    {
      id: 'superhero-3',
      imagePath: '/images/superheroes/paper_hero_pose_gold_bank.png',
      heightAboveGround: 200,
      offsetXSpeed: 2,
      offsetYSpeed: 1.5,
      scale: 0.28 // Normalized to match red cap size (434x367) - reduced
    },
    {
      id: 'superhero-4',
      imagePath: '/images/superheroes/paper_hero_pose_green_level.png',
      heightAboveGround: 200,
      offsetXSpeed: 2,
      offsetYSpeed: 1.5,
      scale: 0.35 // Normalized to match red cap size (510x294) - reduced
    },
    {
      id: 'superhero-5',
      imagePath: '/images/superheroes/paper_hero_pose_purple_dive.png',
      heightAboveGround: 200,
      offsetXSpeed: 2,
      offsetYSpeed: 1.5,
      scale: 0.34 // Normalized to match red cap size (457x310) - reduced
    }
  ],
  
  // House images configuration
  // To add house images:
  // 1. Place image files in /public/images/houses/
  // 2. Add entries to this array with 'imagePath'
  // 3. The system will randomly select one house image when the game loads
  houseImages: [
    {
      id: 'house-1',
      imagePath: '/images/houses/paper_house_remake_blue_roof_yellow_door.png',
      scale: 0.2 // Scale factor for the house image (smaller size)
    },
    {
      id: 'house-2',
      imagePath: '/images/houses/paper_house_cottage_blue.png',
      scale: 0.2 // Scale factor for the house image
    },
    {
      id: 'house-3',
      imagePath: '/images/houses/A_digital_illustration_in_a_charming,_papercraft-s.png',
      scale: 0.2 // Scale factor for the house image
    }
  ],
  
  // Tree images configuration
  // To add tree images:
  // 1. Place image files in /public/images/trees/
  // 2. Add entries to this array with 'imagePath'
  // 3. The system will randomly select one tree image when the game loads
  treeImages: [
    {
      id: 'tree-1',
      imagePath: '/images/trees/paper_tree_round.png',
      scale: 0.3 // Scale factor for the tree image
    },
    {
      id: 'tree-2',
      imagePath: '/images/trees/paper_tree_evergreen.png',
      scale: 0.3 // Scale factor for the tree image
    }
  ],
  
  // Bird images configuration
  // To add bird images:
  // 1. Place image files in /public/images/birds/
  // 2. Add entries to this array with 'imagePath' and 'scale'
  // 3. Image-based birds will be rendered alongside programmatic birds
  birdImages: [
    {
      id: 'bird-1',
      imagePath: '/images/birds/paper_bird_single_brown.png',
      scale: 0.2 // Scale factor for the bird image
    }
  ],
  
  // Castle images configuration
  // To add castle images:
  // 1. Place image files in /public/images/castles/
  // 2. Add entries to this array with 'imagePath' and 'scale'
  // 3. The system will use the first available image for the castle
  castleImages: [
    {
      id: 'castle-1',
      imagePath: '/images/castles/paper_castle_4x.png',
      scale: 0.15 // Scale factor for the castle image (reduced for smaller size)
    }
  ],
  
  // Dragon images configuration
  // To add dragon images:
  // 1. Place image files in /public/images/dragons/
  // 2. Add entries to this array with 'imagePath' and 'scale'
  // 3. The system will use the first available image for the dragon
  dragonImages: [
    {
      id: 'dragon-1',
      imagePath: '/images/dragons/paper_dragon_fire.png',
      scale: 0.3 // Scale factor for the dragon image
    }
  ],
  
  // Fire images configuration
  // To add fire images:
  // 1. Place image files in /public/images/fire/
  // 2. Add entries to this array with 'imagePath' and 'scale'
  // 3. The system will use the first available image for the dragon fire
  fireImages: [
    {
      id: 'fire-1',
      imagePath: '/images/fire/paper_fire_blast.png',
      scale: 0.5 // Scale factor for the fire image
    }
  ],
  
  // Princess images configuration
  // To add princess images:
  // 1. Place image files in /public/images/princesses/
  // 2. Add entries to this array with 'imagePath' and 'scale'
  // 3. The system will use the first available image for the princess
  princessImages: [
    {
      id: 'princess-1',
      imagePath: '/images/princesses/paper_princess_full_help.png',
      scale: 0.15 // Scale factor for the princess image (reduced for smaller size)
    }
  ],

  // Other images configuration
  // To add other images:
  // 1. Place image files in /public/images/others/
  // 2. Add entries to this array with 'imagePath' and 'scale'
  // 3. These images will appear on the scroll view page
  otherImages: [
    {
      id: 'other-1',
      imagePath: '/images/others/paper_arrow.png',
      scale: 0.2 // Scale factor for the image
    },
    {
      id: 'other-2',
      imagePath: '/images/others/paper_laptop.png',
      scale: 0.2 // Scale factor for the image
    },
    {
      id: 'other-3',
      imagePath: '/images/others/paper_magic_sword.png',
      scale: 0.2 // Scale factor for the image
    },
    {
      id: 'other-4',
      imagePath: '/images/others/paper_rock.png',
      scale: 0.2 // Scale factor for the image
    },
    {
      id: 'other-5',
      imagePath: '/images/others/paper_shield.png',
      scale: 0.2 // Scale factor for the image
    }
  ]
}

