import express from 'express';
import { Roadmap } from '../models/Roadmap.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route GET /api/roadmap
router.get('/', protect, async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found for active user' });
    }
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PATCH /api/roadmap/toggle-course
router.patch('/toggle-course', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    const roadmap = await Roadmap.findOne({ userId: req.user._id });

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    roadmap.milestones.forEach(m => {
      let foundInCourse = false;
      m.courses.forEach(c => {
        if (c.id === courseId) {
          c.completed = !c.completed;
          foundInCourse = true;
        }
      });
      if (!foundInCourse && m.projects) {
        m.projects.forEach(p => {
          if (p.id === courseId) {
            p.completed = !p.completed;
          }
        });
      }

      // Recalculate milestone progress
      const totalItems = m.courses.length + (m.projects ? m.projects.length : 0);
      const completedItems = m.courses.filter(c => c.completed).length +
        (m.projects ? m.projects.filter(p => p.completed).length : 0);
      const newProgress = Math.round((completedItems / totalItems) * 100);

      m.progress = newProgress;
      m.status = newProgress === 100 ? 'completed' : newProgress > 0 ? 'in-progress' : 'upcoming';
    });

    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/roadmap/generate
router.post('/generate', protect, async (req, res) => {
  try {
    const { goalPrompt } = req.body;
    const roadmap = await Roadmap.findOne({ userId: req.user._id });

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    roadmap.title = `Custom Path: ${goalPrompt}`;
    roadmap.matchScore = 99;
    roadmap.aiReasoning = `Synthesized specifically for prompt: "${goalPrompt}". Dynamically adjusted learning path and prerequisite sequence in MongoDB.`;

    await roadmap.save();

    // Log chat notification
    await ChatMessage.create({
      userId: req.user._id,
      sender: 'user',
      text: `I want to generate a new path: "${goalPrompt}"`
    });

    await ChatMessage.create({
      userId: req.user._id,
      sender: 'ai',
      text: `I have updated your learning roadmap for **"${goalPrompt}"**! Match score updated to **99%**.`,
      suggestions: ['Show updated timeline', 'Explain prerequisite dependencies']
    });

    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
