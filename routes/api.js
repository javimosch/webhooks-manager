const express = require('express');
const router = express.Router();
const WebhookType = require('../models/WebhookType');
const Webhook = require('../models/Webhook');
const GlobalSettings = require('../models/GlobalSettings');
const axios = require('axios');

// Middleware for basic auth
const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }
  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];
  if (user === 'admin' && pass === 'password') {
    next();
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

router.use(basicAuth);

// Webhook Type CRUD
router.post('/webhook-types', async (req, res) => {
  try {
    const webhookType = new WebhookType(req.body);
    await webhookType.save();
    res.status(201).json(webhookType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/webhook-types', async (req, res) => {
  try {
    const webhookTypes = await WebhookType.find();
    res.json(webhookTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/webhook-types/:id', async (req, res) => {
  try {
    const webhookType = await WebhookType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(webhookType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/webhook-types/:id', async (req, res) => {
  try {
    await WebhookType.findByIdAndDelete(req.params.id);
    res.json({ message: 'Webhook type deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Webhook CRUD
router.post('/webhooks', async (req, res) => {
  try {
    const webhook = new Webhook(req.body);
    await webhook.save();
    res.status(201).json(webhook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/webhooks', async (req, res) => {
  try {
    const webhooks = await Webhook.find().populate('type');
    res.json(webhooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/webhooks/:id', async (req, res) => {
  try {
    const webhook = await Webhook.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(webhook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/webhooks/:id', async (req, res) => {
  try {
    await Webhook.findByIdAndDelete(req.params.id);
    res.json({ message: 'Webhook deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Run webhook
router.post('/run-webhook/:id', async (req, res) => {
  try {
    const webhook = await Webhook.findById(req.params.id);
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }

    const result = await runWebhook(webhook);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Run webhook type
router.post('/run-webhook-type/:id', async (req, res) => {
  try {
    const webhookType = await WebhookType.findById(req.params.id);
    if (!webhookType) {
      return res.status(404).json({ message: 'Webhook type not found' });
    }

    const webhooks = await Webhook.find({ type: webhookType._id });
    const results = [];

    if (webhookType.runType === 'parallel') {
      const promises = webhooks.map(webhook => runWebhook(webhook));
      results.push(...await Promise.all(promises));
    } else {
      for (const webhook of webhooks) {
        results.push(await runWebhook(webhook));
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Global Settings
router.get('/global-settings', async (req, res) => {
  try {
    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = new GlobalSettings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/global-settings', async (req, res) => {
  try {
    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = new GlobalSettings();
    }
    settings.globalTimeout = req.body.globalTimeout || settings.globalTimeout;
    settings.guiTheme = req.body.guiTheme || settings.guiTheme;
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

async function runWebhook(webhook) {
  const settings = await GlobalSettings.findOne();
  const timeout = webhook.timeout || settings.globalTimeout;

  try {
    const response = await axios({
      method: webhook.method,
      url: webhook.url,
      data: webhook.method !== 'GET' ? webhook.payload : undefined,
      params: webhook.method === 'GET' ? webhook.payload : undefined,
      timeout: timeout,
    });

    return {
      webhookId: webhook._id,
      status: 'success',
      statusCode: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      webhookId: webhook._id,
      status: 'error',
      message: error.message,
    };
  }
}

module.exports = router;