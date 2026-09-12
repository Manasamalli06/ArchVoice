const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const { parseIntent } = require('../ai/intentParser');
const { executeAction } = require('../ai/actionExecutors');

// --- AUTHENTICATION ---
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: 'insensitive' } }
    });

    if (!user) {
      return res.status(404).json({
        error: 'No account found with this email. Please click "Register" above to create your account first.'
      });
    }

    if (user.password && password && user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    res.json({
      message: 'Login successful',
      token: 'mock-jwt-token-' + user.id,
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: 'insensitive' } }
    });

    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please sign in instead.' });
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: password || 'password123',
        role: role || 'Lead Architect',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`
      }
    });

    res.status(201).json({
      message: 'Registration successful',
      token: 'mock-jwt-token-' + newUser.id,
      user: newUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PROJECTS ---
router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tasks: true,
        approvals: true,
        documents: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/projects/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        tasks: { orderBy: { dueDate: 'asc' } },
        approvals: { orderBy: { dueDate: 'asc' } },
        documents: true,
        activities: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- TASKS ---
router.get('/tasks', async (req, res) => {
  try {
    const { projectId, status, priority, assignedTo } = req.query;
    const where = {};

    if (projectId && projectId !== 'all') where.projectId = projectId;
    if (status && status !== 'all') {
      if (status === 'overdue') {
        where.OR = [
          { status: 'Overdue' },
          { AND: [{ dueDate: { lt: new Date() } }, { status: { not: 'Completed' } }] }
        ];
      } else {
        where.status = { equals: status, mode: 'insensitive' };
      }
    }
    if (priority && priority !== 'all') where.priority = priority;
    if (assignedTo && assignedTo !== 'all') {
      where.assignedTo = { contains: assignedTo, mode: 'insensitive' };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: { project: true },
      orderBy: { dueDate: 'asc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assignedTo,
        priority: priority || 'Medium',
        status: 'Pending',
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 86400000)
      },
      include: { project: true }
    });

    await prisma.activity.create({
      data: {
        message: `Task "${title}" created and assigned to ${assignedTo}.`,
        projectId
      }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/tasks/:id', async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body;
    const data = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (assignedTo) data.assignedTo = assignedTo;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data,
      include: { project: true }
    });

    if (status) {
      await prisma.activity.create({
        data: {
          message: `Task "${task.title}" updated to status ${status}.`,
          projectId: task.projectId
        }
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- APPROVALS ---
router.get('/approvals', async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const where = {};
    if (projectId && projectId !== 'all') where.projectId = projectId;
    if (status && status !== 'all') where.status = status;

    const approvals = await prisma.approval.findMany({
      where,
      include: { project: true },
      orderBy: { dueDate: 'asc' }
    });
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/approvals/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const approval = await prisma.approval.update({
      where: { id: req.params.id },
      data: { status },
      include: { project: true }
    });

    await prisma.activity.create({
      data: {
        message: `Approval "${approval.title}" set to ${status}.`,
        projectId: approval.projectId
      }
    });

    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- TEAM ---
router.get('/team', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Fetch task counts for each team member
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const tasks = await prisma.task.findMany({
          where: { assignedTo: { contains: u.name.split(' ')[0] } }
        });
        const overdue = tasks.filter(t => t.status === 'Overdue').length;
        const completed = tasks.filter(t => t.status === 'Completed').length;
        return {
          ...u,
          totalTasks: tasks.length,
          overdueTasks: overdue,
          completedTasks: completed
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- DOCUMENTS ---
router.get('/documents', async (req, res) => {
  try {
    const { projectId } = req.query;
    const where = {};
    if (projectId && projectId !== 'all') where.projectId = projectId;

    const docs = await prisma.document.findMany({
      where,
      include: { project: true },
      orderBy: { uploadedAt: 'desc' }
    });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ACTIVITY ---
router.get('/activity', async (req, res) => {
  try {
    const { projectId } = req.query;
    const where = {};
    if (projectId && projectId !== 'all') where.projectId = projectId;

    const activities = await prisma.activity.findMany({
      where,
      include: { project: true },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- AI ASSISTANT CHAT ENDPOINT ---
router.post('/assistant/chat', async (req, res) => {
  try {
    const { message, projectContext } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message payload is required' });
    }

    // 1. Intent & Entity classification
    const intentResult = await parseIntent(message, projectContext);

    // 2. Safe Database query/mutation execution
    const executionResult = await executeAction(intentResult, message);

    res.json({
      query: message,
      intent: intentResult.intent,
      entities: intentResult.entities,
      isDemoFallback: intentResult.isDemoFallback,
      response: executionResult.text,
      widgetType: executionResult.widgetType,
      widgetData: executionResult.data
    });
  } catch (error) {
    console.error('API Assistant Chat Error:', error);
    res.status(500).json({
      error: 'Failed to process AI chat query',
      details: error.message
    });
  }
});

module.exports = router;
