const express = require('express');
const router = express.Router();
const WebhookType = require('../models/WebhookType');
const Webhook = require('../models/Webhook');
const GlobalSettings = require('../models/GlobalSettings');
const axios = require('axios');

// Middleware to pass global settings to all views
router.use(async (req, res, next) => {
  try {
    const settings = await GlobalSettings.findOne();
    res.locals.guiTheme = settings ? settings.guiTheme : 'light';
    next();
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
const handleError = (res, error) => {
  console.error(error);
  res.status(500).render('error', { message: error.message || 'An unexpected error occurred' });
};

// Dashboard
router.get('/', async (req, res) => {
  try {
    const webhookTypes = await WebhookType.find();
    const webhooks = await Webhook.find().populate('type');
    
    // Get execution metrics
    const executions = await Webhook.aggregate([
      { $unwind: '$executions' },
      {
        $group: {
          _id: {
            webhookId: '$_id',
            webhookTitle: '$title',
            webhookTypeId: '$type',
          },
          executions: { $push: '$executions' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'webhooktypes',
          localField: '_id.webhookTypeId',
          foreignField: '_id',
          as: 'webhookType',
        },
      },
      { $unwind: '$webhookType' },
      {
        $project: {
          _id: 0,
          webhookId: '$_id.webhookId',
          webhookTitle: '$_id.webhookTitle',
          webhookType: '$webhookType.name',
          executions: 1,
          count: 1,
        },
      },
    ]);

    res.render('dashboard', { webhookTypes, webhooks, executions });
  } catch (error) {
    handleError(res, error);
  }
});

// Webhook Types
router.get('/webhook-types', async (req, res) => {
  try {
    const webhookTypes = await WebhookType.find();
    res.render('webhook-types', { webhookTypes });
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/webhook-types/new', (req, res) => {
  res.render('webhook-type-form', { webhookType: null });
});

router.post('/webhook-types', async (req, res) => {
  try {
    const { name, runType } = req.body;
    const newWebhookType = new WebhookType({ name, runType });
    await newWebhookType.save();
    res.redirect('/webhook-types');
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/webhook-types/:id/edit', async (req, res) => {
  try {
    const webhookType = await WebhookType.findById(req.params.id);
    res.render('webhook-type-form', { webhookType });
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/webhook-types/:id', async (req, res) => {
  try {
    const { name, runType } = req.body;
    await WebhookType.findByIdAndUpdate(req.params.id, { name, runType });
    res.redirect('/webhook-types');
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/webhook-types/:id/delete', async (req, res) => {
  try {
    await WebhookType.findByIdAndDelete(req.params.id);
    res.redirect('/webhook-types');
  } catch (error) {
    handleError(res, error);
  }
});

// Webhooks
router.get('/webhooks', async (req, res) => {
  try {
    const webhooks = await Webhook.find().populate('type');
    res.render('webhooks', { webhooks });
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/webhooks/new', async (req, res) => {
  try {
    const webhookTypes = await WebhookType.find();
    res.render('webhook-form', { webhook: null, webhookTypes });
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/webhooks', async (req, res) => {
  try {
    const { title, type, url, method, payload, async, timeout, draft } = req.body;
    const newWebhook = new Webhook({
      title,
      type,
      url,
      method,
      payload: JSON.parse(payload),
      async: async === 'on',
      timeout: parseInt(timeout) * 1000, // Convert seconds to milliseconds
      draft: draft === 'on'
    });
    await newWebhook.save();
    res.redirect('/webhooks');
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/webhooks/:id/edit', async (req, res) => {
  try {
    const webhook = await Webhook.findById(req.params.id);
    const webhookTypes = await WebhookType.find();
    res.render('webhook-form', { webhook, webhookTypes });
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/webhooks/:id', async (req, res) => {
  try {
    const { title, type, url, method, payload, async, timeout, draft } = req.body;
    await Webhook.findByIdAndUpdate(req.params.id, {
      title,
      type,
      url,
      method,
      payload: JSON.parse(payload),
      async: async === 'on',
      timeout: parseInt(timeout) * 1000, // Convert seconds to milliseconds
      draft: draft === 'on'
    });
    res.redirect('/webhooks');
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/webhooks/:id/delete', async (req, res) => {
  try {
    await Webhook.findByIdAndDelete(req.params.id);
    res.redirect('/webhooks');
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/run-webhook/:id', async (req, res) => {
  try {
    const webhook = await Webhook.findById(req.params.id);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const result = await runWebhook(webhook);
    res.render('webhook-result', { webhook, result });
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/run-webhook-type/:id', async (req, res) => {
  try {
    const webhookType = await WebhookType.findById(req.params.id);
    if (!webhookType) {
      throw new Error('Webhook type not found');
    }

    const webhooks = await Webhook.find({ type: webhookType._id, draft: false });
    const results = [];

    if (webhookType.runType === 'parallel') {
      const promises = webhooks.map(webhook => runWebhook(webhook));
      results.push(...await Promise.all(promises));
    } else {
      for (const webhook of webhooks) {
        results.push(await runWebhook(webhook));
      }
    }

    res.render('webhook-type-result', { webhookType, results });
  } catch (error) {
    handleError(res, error);
  }
});

// Global Settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = new GlobalSettings();
      await settings.save();
    }
    res.render('settings', { settings });
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/settings', async (req, res) => {
  try {
    const { globalTimeout, guiTheme } = req.body;
    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = new GlobalSettings();
    }
    settings.globalTimeout = parseInt(globalTimeout) * 1000; // Convert to milliseconds
    settings.guiTheme = guiTheme;
    await settings.save();
    res.locals.guiTheme = settings.guiTheme; // Update the theme for the current response
    res.redirect('/settings');
  } catch (error) {
    handleError(res, error);
  }
});

async function runWebhook(webhook) {
  const axiosConfig = {
    method: webhook.method,
    url: webhook.url,
    data: webhook.method !== 'GET' ? webhook.payload : undefined,
    params: webhook.method === 'GET' ? webhook.payload : undefined,
    timeout: webhook.timeout,
  };

  let execution = {
    status: 'started',
    executedAt: new Date(),
  };

  try {
    if (webhook.async) {
      axios(axiosConfig)
        .then((response) => {
          execution.status = 'success';
          execution.statusCode = response.status;
          execution.responseData = response.data;
          webhook.executions.push(execution);
          webhook.save();
        })
        .catch((error) => {
          execution.status = 'error';
          execution.errorMessage = error.message;
          webhook.executions.push(execution);
          webhook.save();
        });
      return { webhook: webhook._id, status: 'started', message: 'Webhook execution started asynchronously' };
    } else {
      const response = await axios(axiosConfig);
      execution.status = 'success';
      execution.statusCode = response.status;
      execution.responseData = response.data;
      webhook.executions.push(execution);
      await webhook.save();
      return {
        webhook: webhook._id,
        status: 'success',
        statusCode: response.status,
        data: response.data,
      };
    }
  } catch (error) {
    execution.status = 'error';
    execution.errorMessage = error.message;
    webhook.executions.push(execution);
    await webhook.save();
    return {
      webhook: webhook._id,
      status: 'error',
      message: error.message,
    };
  }
}

module.exports = router;