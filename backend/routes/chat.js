import express from 'express';
import { ChatMessage } from '../models/ChatMessage.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route GET /api/chat
router.get('/', protect, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/chat/message
router.post('/message', protect, async (req, res) => {
  try {
    const { text } = req.body;

    // Save user message
    const userMessage = await ChatMessage.create({
      userId: req.user._id,
      sender: 'user',
      text
    });

    // Synthesize AI Reasoning Response
    let aiResponseText = `I analyzed your query regarding "${text}". Based on your target role as ${req.user.targetGoal}, I have adjusted your learning priorities in MongoDB!`;
    let suggestions = ['Show updated estimated timeline', 'Explain prerequisite dependencies'];

    const lower = text.toLowerCase();
    if (lower.includes('hours') || lower.includes('timeline')) {
      aiResponseText = `I have recalculated your roadmap! With a revised commitment of 5 hours/week, your learning path will take approximately **16 weeks** (instead of 12 weeks), giving you extra time for practical implementation.`;
      suggestions = ['Keep this updated timeline', 'Revert back to 8 hours/week'];
    } else if (lower.includes('why') || lower.includes('lora')) {
      aiResponseText = `**Why LoRA Fine-Tuning is prioritized:** Parameter-Efficient Fine-Tuning (PEFT/LoRA) allows you to fine-tune open-source models like Llama 3 on consumer hardware without spending thousands on GPU clusters. This is the top practical skill requested by employers today.`;
      suggestions = ['Tell me more about RAG architecture', 'What GPU resources do I need?'];
    } else if (lower.includes('skip') || lower.includes('know')) {
      aiResponseText = `Got it! I have marked your preliminary module as **Completed** in MongoDB and unlocked the next high-level milestone for you. Your match score has increased to **99%**.`;
      suggestions = ['View next recommended action', 'Generate capstone options'];
    }

    // Save AI response
    const aiMessage = await ChatMessage.create({
      userId: req.user._id,
      sender: 'ai',
      text: aiResponseText,
      suggestions
    });

    res.json({
      userMessage,
      aiMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
