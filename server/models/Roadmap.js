import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  id: String,
  title: String,
  provider: String,
  duration: String,
  level: String,
  rating: Number,
  badge: String,
  type: String,
  completed: Boolean,
  aiInsight: String,
  url: String
});

const milestoneSchema = new mongoose.Schema({
  id: String,
  phase: Number,
  title: String,
  status: String,
  progress: Number,
  prerequisites: [String],
  courses: [courseSchema],
  projects: [courseSchema]
});

const skillSchema = new mongoose.Schema({
  name: String,
  current: Number,
  target: Number
});

const roadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  matchScore: {
    type: Number,
    default: 98
  },
  aiReasoning: String,
  estimatedWeeks: {
    type: Number,
    default: 12
  },
  totalHours: {
    type: Number,
    default: 96
  },
  milestones: [milestoneSchema],
  skillsAcquired: [skillSchema]
}, { timestamps: true });

export const Roadmap = mongoose.model('Roadmap', roadmapSchema);
