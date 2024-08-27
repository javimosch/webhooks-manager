const mongoose = require('mongoose');

const WebhookTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  runType: {
    type: String,
    enum: ['parallel', 'series'],
    default: 'parallel',
  },
}, { timestamps: true });

module.exports = mongoose.model('WebhookType', WebhookTypeSchema);