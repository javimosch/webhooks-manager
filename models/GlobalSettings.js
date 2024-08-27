const mongoose = require('mongoose');

const GlobalSettingsSchema = new mongoose.Schema({
  globalTimeout: {
    type: Number,
    default: 30000, // 30 seconds
  },
  guiTheme: {
    type: String,
    enum: ['dark', 'light'],
    default: 'light',
  },
}, { timestamps: true });

module.exports = mongoose.model('GlobalSettings', GlobalSettingsSchema);