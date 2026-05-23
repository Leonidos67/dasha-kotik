import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    submissionType: {
      type: String,
      enum: ['photo', 'voice', 'text', 'workout', 'video'],
      required: true,
    },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const giftSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Подарок дня' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true, unique: true, min: 1, max: 31 },
    date: { type: Date, required: true },
    isBonus: { type: Boolean, default: false },
    isFinale: { type: Boolean, default: false },
    title: { type: String, default: '' },
    tasks: [taskSchema],
    gift: { type: giftSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const Day = mongoose.model('Day', daySchema);
