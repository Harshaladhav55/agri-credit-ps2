import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  suggestions: [String],
  timestamp: {
    type: String,
    default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}, { timestamps: true });

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
