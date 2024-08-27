const mongoose = require('mongoose');

const ExecutionSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['success', 'error', 'started'],
    required: true,
  },
  statusCode: Number,
  responseData: mongoose.Schema.Types.Mixed,
  errorMessage: String,
  executedAt: {
    type: Date,
    default: Date.now,
  },
});

const WebhookSchema = new mongoose.Schema({
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WebhookType',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PATCH', 'DELETE'],
    required: true,
  },
  async: {
    type: Boolean,
    default: false,
  },
  timeout: {
    type: Number,
    default: 30000, // 30 seconds
  },
  draft: {
    type: Boolean,
    default: false,
  },
  executions: [ExecutionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Webhook', WebhookSchema);