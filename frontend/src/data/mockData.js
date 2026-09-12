export const DEMO_PERSONAS = [
  {
    id: 'ai-specialist',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    role: 'Software Engineer',
    targetGoal: 'Generative AI & LLM Architect',
    experienceLevel: 'Intermediate',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    completedCourses: ['Python for Data Science', 'Machine Learning Basics', 'SQL Fundamentals'],
    weeklyCommitment: 8,
    preferredStyle: 'Hands-on Projects & Labs',
  },
  {
    id: 'cloud-devops',
    name: 'Alex Rivera',
    email: 'alex.r@example.com',
    role: 'Systems Administrator',
    targetGoal: 'Cloud & DevOps Solutions Architect',
    experienceLevel: 'Beginner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    completedCourses: ['Linux Administration', 'Networking Basics'],
    weeklyCommitment: 6,
    preferredStyle: 'Guided Video Courses & Quizzes',
  },
  {
    id: 'fullstack-dev',
    name: 'Priya Sharma',
    email: 'priya.s@example.com',
    role: 'Frontend Developer',
    targetGoal: 'Full Stack MERN & AI Integration Lead',
    experienceLevel: 'Intermediate',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    completedCourses: ['HTML/CSS/JS Deep Dive', 'React Essentials', 'Node.js Starter'],
    weeklyCommitment: 10,
    preferredStyle: 'Capstone Projects & Peer Reviews',
  }
];

export const INITIAL_ROADMAPS = {
  'ai-specialist': {
    title: 'Generative AI & LLM Engineering Master Path',
    domain: 'Artificial Intelligence',
    estimatedWeeks: 12,
    totalHours: 96,
    matchScore: 98,
    aiReasoning: 'Based on your intermediate Python background and SQL knowledge, we accelerated Phase 1 fundamentals and focused 60% of the path on practical Transformer fine-tuning, RAG architecture, and deployment.',
    milestones: [
      {
        id: 'm1',
        phase: 1,
        title: 'Phase 1: Deep Learning Foundations & PyTorch',
        status: 'completed',
        progress: 100,
        prerequisites: ['Python for Data Science'],
        courses: [
          {
            id: 'c101',
            title: 'Neural Networks & PyTorch in Practice',
            provider: 'Pathcraft Executive',
            duration: '14 hrs',
            level: 'Intermediate',
            type: 'Course',
            badge: 'Essential Prerequisite',
            aiInsight: 'Crucial bridge between classical ML and modern Transformer architectures.',
            completed: true
          },
          {
            id: 'c102',
            title: 'Computer Vision & NLP Fundamentals',
            provider: 'Pathcraft AI',
            duration: '10 hrs',
            level: 'Intermediate',
            type: 'Course',
            badge: 'Core Skill',
            aiInsight: 'Establishes tokenization, embeddings, and attention mechanics.',
            completed: true
          }
        ],
        projects: [
          {
            id: 'p101',
            title: 'Build a Custom Sentiment Classifier with PyTorch',
            type: 'Mini-Project',
            duration: '6 hrs',
            completed: true
          }
        ]
      },
      {
        id: 'm2',
        phase: 2,
        title: 'Phase 2: Transformers & Large Language Models (LLMs)',
        status: 'in-progress',
        progress: 65,
        prerequisites: ['Neural Networks & PyTorch in Practice'],
        courses: [
          {
            id: 'c201',
            title: 'Transformer Architectures & Hugging Face Deep Dive',
            provider: 'Pathcraft AI Lab',
            duration: '18 hrs',
            level: 'Advanced',
            type: 'Course',
            badge: 'High Impact',
            aiInsight: 'Directly addresses your objective of mastering self-attention, BERT, and GPT architectures.',
            completed: true
          },
          {
            id: 'c202',
            title: 'Parameter-Efficient Fine-Tuning (LoRA & QLoRA)',
            provider: 'Pathcraft AI Lab',
            duration: '16 hrs',
            level: 'Advanced',
            type: 'Course',
            badge: 'Industry Preferred',
            aiInsight: 'Teaches memory-efficient adaptation of open-weights models (Llama 3, Mistral).',
            completed: false
          }
        ],
        projects: [
          {
            id: 'p201',
            title: 'Fine-Tuning Llama 3 on Domain-Specific Legal Documents',
            type: 'Hands-on Lab',
            duration: '12 hrs',
            completed: false
          }
        ]
      },
      {
        id: 'm3',
        phase: 3,
        title: 'Phase 3: RAG Architecture & Vector Databases',
        status: 'upcoming',
        progress: 0,
        prerequisites: ['Transformer Architectures & Hugging Face Deep Dive'],
        courses: [
          {
            id: 'c301',
            title: 'Enterprise RAG Systems with LangChain & LlamaIndex',
            provider: 'Pathcraft Masters',
            duration: '20 hrs',
            level: 'Advanced',
            type: 'Course',
            badge: 'Career Target',
            aiInsight: 'Key skill requested in 84% of Generative AI job postings in 2026.',
            completed: false
          },
          {
            id: 'c302',
            title: 'Vector DB Benchmarking (Pinecone, Qdrant, Milvus)',
            provider: 'Pathcraft AI',
            duration: '8 hrs',
            level: 'Intermediate',
            type: 'Lab',
            badge: 'Tool Mastery',
            aiInsight: 'Teaches scalable indexing, hybrid search, and semantic similarity optimization.',
            completed: false
          }
        ],
        projects: [
          {
            id: 'p301',
            title: 'Capstone: Production Enterprise Assistant with Guardrails',
            type: 'Industry Capstone',
            duration: '20 hrs',
            completed: false
          }
        ]
      }
    ],
    skillsAcquired: [
      { name: 'PyTorch & Neural Nets', current: 85, target: 90 },
      { name: 'Transformers & HuggingFace', current: 70, target: 95 },
      { name: 'LLM Fine-Tuning (LoRA)', current: 40, target: 85 },
      { name: 'RAG & Vector Databases', current: 30, target: 90 },
      { name: 'AI Agent Deployment', current: 15, target: 80 }
    ]
  },
  'cloud-devops': {
    title: 'Cloud & DevOps Architecture Roadmap',
    domain: 'Cloud Computing',
    estimatedWeeks: 14,
    totalHours: 110,
    matchScore: 95,
    aiReasoning: 'Structured from beginner foundations to AWS Cloud Solutions Architect certification and Kubernetes container orchestration.',
    milestones: [
      {
        id: 'm1',
        phase: 1,
        title: 'Phase 1: Cloud & Linux Essentials',
        status: 'in-progress',
        progress: 80,
        prerequisites: ['Linux Administration'],
        courses: [
          {
            id: 'c101_dev',
            title: 'AWS Certified Cloud Practitioner Mastery',
            provider: 'Pathcraft AI',
            duration: '16 hrs',
            level: 'Beginner',
            type: 'Course',
            badge: 'Foundational',
            aiInsight: 'Establishes AWS core services, IAM, EC2, S3, and VPC architecture.',
            completed: true
          }
        ],
        projects: [
          {
            id: 'p101_dev',
            title: 'Deploy Highly Available Multi-AZ Web App on AWS',
            type: 'Hands-on Lab',
            duration: '8 hrs',
            completed: false
          }
        ]
      },
      {
        id: 'm2',
        phase: 2,
        title: 'Phase 2: CI/CD Pipelines & Infrastructure as Code',
        status: 'upcoming',
        progress: 0,
        prerequisites: ['AWS Certified Cloud Practitioner Mastery'],
        courses: [
          {
            id: 'c201_dev',
            title: 'Terraform & CloudFormation Automation',
            provider: 'Pathcraft AI',
            duration: '22 hrs',
            level: 'Intermediate',
            type: 'Course',
            badge: 'High Demand',
            aiInsight: 'Automates cloud resource provisioning using declarative code.',
            completed: false
          }
        ],
        projects: []
      }
    ],
    skillsAcquired: [
      { name: 'Linux System Admin', current: 75, target: 85 },
      { name: 'AWS Core Infrastructure', current: 60, target: 90 },
      { name: 'Docker & Containers', current: 30, target: 85 },
      { name: 'Terraform IaC', current: 10, target: 80 },
      { name: 'CI/CD Pipelines (GitHub Actions)', current: 20, target: 85 }
    ]
  },
  'fullstack-dev': {
    title: 'Full Stack MERN & AI Integration Path',
    domain: 'Software Engineering',
    estimatedWeeks: 10,
    totalHours: 80,
    matchScore: 96,
    aiReasoning: 'Leverages your strong React frontend foundation and fills backend Node/Express gaps while integrating AI SDK APIs.',
    milestones: [
      {
        id: 'm1',
        phase: 1,
        title: 'Phase 1: Advanced Node.js & Microservices',
        status: 'in-progress',
        progress: 50,
        prerequisites: ['React Essentials'],
        courses: [
          {
            id: 'c101_fs',
            title: 'Scalable Microservices with Node.js & Express',
            provider: 'Pathcraft Masters',
            duration: '20 hrs',
            level: 'Intermediate',
            type: 'Course',
            badge: 'Core Backend',
            aiInsight: 'Completes your full-stack capability with REST, GraphQL, and JWT auth.',
            completed: true
          }
        ],
        projects: []
      }
    ],
    skillsAcquired: [
      { name: 'React & Frontend state', current: 90, target: 95 },
      { name: 'Node.js & Express REST APIs', current: 60, target: 85 },
      { name: 'MongoDB & PostgreSQL', current: 40, target: 80 },
      { name: 'AI API Integration (OpenAI/Gemini SDK)', current: 25, target: 85 }
    ]
  }
};

export const AI_SUGGESTED_PROMPTS = [
  "I want to transition into Generative AI from a software engineering background.",
  "Can you reduce the weekly commitment to 5 hours and add more hands-on labs?",
  "Why did you recommend Parameter-Efficient Fine-Tuning (LoRA) before RAG?",
  "I already know Docker basics—can I skip that milestone?",
  "What capstone project will best prepare me for a Senior AI Architect role?"
];
