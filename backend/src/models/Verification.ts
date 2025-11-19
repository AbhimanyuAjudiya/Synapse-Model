import mongoose, { Schema, Document } from 'mongoose';

export interface VerificationDocument extends Document {
  jobId: string;
  txHash: string;
  certificateId?: string;
  verified: boolean;
  verifiedAt: Date;
  verifier: string;
  error?: string;
}

const VerificationSchema = new Schema<VerificationDocument>(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    txHash: {
      type: String,
      required: true,
      unique: true,
    },
    certificateId: {
      type: String,
      default: null,
    },
    verified: {
      type: Boolean,
      required: true,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    verifier: {
      type: String,
      required: true,
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const VerificationModel = mongoose.model<VerificationDocument>(
  'Verification',
  VerificationSchema
);
