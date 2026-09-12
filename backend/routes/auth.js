import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Roadmap } from '../models/Roadmap.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pathcraft_ai_jwt_secret_key_2026', {
    expiresIn: '30d'
  });
};

const defaultInitialMilestones = [
  {
    id: 'm1',
    phase: 1,
    title: 'Phase 1: Deep Learning Foundations & PyTorch',
    status: 'in-progress',
    progress: 50,
    prerequisites: ['Python basics', 'Linear Algebra', 'Calculus fundamentals'],
    courses: [
      {
        id: 'c1',
        title: 'Neural Networks & PyTorch in Practice',
        provider: 'Pathcraft Executive',
        duration: '12 hours',
        level: 'Intermediate',
        rating: 4.9,
        badge: 'Essential Prerequisite',
        type: 'course',
        completed: true,
        aiInsight: 'Crucial bridge between classical ML and modern Transformer architectures.'
      },
      {
        id: 'c2',
        title: 'Deep Learning Specialization (DeepLearning.AI)',
        provider: 'DeepLearning.AI',
        duration: '24 hours',
        level: 'Intermediate',
        rating: 4.8,
        badge: 'Core Theory',
        type: 'course',
        completed: false,
        aiInsight: 'Solidifies backpropagation and activation function math.'
      }
    ],
    projects: [
      {
        id: 'p1',
        title: 'Build Custom Neural Net from Scratch',
        provider: 'Pathcraft Hands-On Lab',
        duration: '6 hours',
        level: 'Intermediate',
        rating: 4.9,
        badge: 'Lab Capstone',
        type: 'project',
        completed: false,
        aiInsight: 'Demonstrates deep understanding of forward/backward pass math.'
      }
    ]
  },
  {
    id: 'm2',
    phase: 2,
    title: 'Phase 2: Transformers & Large Language Models',
    status: 'upcoming',
    progress: 0,
    prerequisites: ['Phase 1 Completion', 'PyTorch Tensors mastery'],
    courses: [
      {
        id: 'c3',
        title: 'Hugging Face NLP & Transformer Architecture',
        provider: 'Hugging Face',
        duration: '16 hours',
        level: 'Advanced',
        rating: 4.9,
        badge: 'Top Industry Skill',
        type: 'course',
        completed: false,
        aiInsight: 'Highest ROI skill for generative AI engineering roles.'
      },
      {
        id: 'c4',
        title: 'Parameter-Efficient Fine-Tuning (LoRA/PEFT)',
        provider: 'Pathcraft Labs',
        duration: '10 hours',
        level: 'Advanced',
        rating: 4.9,
        badge: 'Specialized',
        type: 'course',
        completed: false,
        aiInsight: 'Learn to fine-tune Llama 3 on consumer GPUs.'
      }
    ],
    projects: [
      {
        id: 'p2',
        title: 'Fine-Tune Open Source LLM on Domain Dataset',
        provider: 'Capstone Project',
        duration: '15 hours',
        level: 'Advanced',
        rating: 5.0,
        badge: 'Portfolio Winner',
        type: 'project',
        completed: false,
        aiInsight: 'Direct proof of capability for target Generative AI Architect role.'
      }
    ]
  }
];

const defaultInitialSkills = [
  { name: 'Python & PyTorch', current: 85, target: 95 },
  { name: 'Transformer Architecture', current: 70, target: 90 },
  { name: 'LLM Fine-Tuning (LoRA)', current: 40, target: 85 },
  { name: 'RAG & Vector Databases', current: 50, target: 90 },
  { name: 'Prompt Engineering', current: 90, target: 95 }
];

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, targetGoal } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    const user = await User.create({
      name,
      email,
      password,
      targetGoal: targetGoal || 'Generative AI & LLM Architect'
    });

    if (user) {
      // Create Initial Roadmap in MongoDB
      const initialRoadmap = await Roadmap.create({
        userId: user._id,
        title: `Personalized AI Path for ${user.name}`,
        matchScore: 98,
        aiReasoning: `Tailored AI learning path synthesized for ${user.name} (${user.email}) matching target goal: ${user.targetGoal}.`,
        milestones: defaultInitialMilestones,
        skillsAcquired: defaultInitialSkills
      });

      // Create Initial Welcome Chat Message in MongoDB
      await ChatMessage.create({
        userId: user._id,
        sender: 'ai',
        text: `Hello ${user.name}! Welcome to Pathcraft AI. I have synthesized your **Personalized AI Learning Path** with a 98% goal match. How can I help you customize your roadmap today?`,
        suggestions: [
          'Why did you recommend this roadmap?',
          'Adjust path commitment to 5 hours/week',
          'Add hands-on capstone project'
        ]
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        targetGoal: user.targetGoal,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Ensure roadmap exists
      let roadmap = await Roadmap.findOne({ userId: user._id });
      if (!roadmap) {
        roadmap = await Roadmap.create({
          userId: user._id,
          title: `Personalized AI Path for ${user.name}`,
          matchScore: 98,
          aiReasoning: `Tailored AI learning path synthesized for ${user.name} (${user.email}).`,
          milestones: defaultInitialMilestones,
          skillsAcquired: defaultInitialSkills
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        targetGoal: user.targetGoal,
        experienceLevel: user.experienceLevel,
        weeklyCommitment: user.weeklyCommitment,
        avatar: user.avatar,
        completedCourses: user.completedCourses,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
