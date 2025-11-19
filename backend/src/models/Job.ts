import mongoose, { Schema, Document } from 'mongoose';
import { Job as IJob, JobStatus } from '../types';

export interface JobDocument extends Omit<IJob, 'id'>, Document {}

const JobSchema = new Schema<JobDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    modelId: {
      type: String,
      required: true,
      index: true,
    },
    inputData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    inputHash: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.PENDING,
      index: true,
    },
    result: {
      type: Schema.Types.Mixed,
      default: null,
    },
    teeSignature: {
      type: String,
      default: null,
    },
    enclavePublicKey: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Number,
      default: null,
    },
    verificationTxHash: {
      type: String,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for efficient queries
JobSchema.index({ userId: 1, createdAt: -1 });
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ verificationTxHash: 1 });

export const JobModel = mongoose.model<JobDocument>('Job', JobSchema);
