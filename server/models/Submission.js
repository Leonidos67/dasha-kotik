import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    filename: String,
    originalName: String,
    mimeType: String,
    url: String,
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, default: 'dasha' },
    dayNumber: { type: Number, required: true, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    text: { type: String, default: '' },
    files: [fileSchema],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    giftSeen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

submissionSchema.index({ userId: 1, dayNumber: 1, taskId: 1 }, { unique: true });

export const Submission = mongoose.model('Submission', submissionSchema);
