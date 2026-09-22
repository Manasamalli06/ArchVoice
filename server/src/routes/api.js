const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const PDFDocument = require('pdfkit');
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

// --- DOCUMENT DOWNLOAD (generates a real PDF) ---
router.get('/documents/:id/download', async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    // Generate a real PDF
    const pdfDoc = new PDFDocument({ size: 'A4', margin: 60 });

    // Set download headers
    const safeFileName = doc.name.replace(/\.[^.]+$/, '') + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    pdfDoc.pipe(res);

    // --- Cover / Title area ---
    pdfDoc.rect(0, 0, 595.28, 160).fill('#0b1628');
    pdfDoc.fontSize(10).fillColor('#64748b').text('ARCHVOICE — AEC PROJECT MANAGEMENT PLATFORM', 60, 40);
    pdfDoc.fontSize(22).fillColor('#ffffff').text(doc.name, 60, 70, { width: 475 });
    pdfDoc.fontSize(11).fillColor('#94a3b8').text(`${doc.type}  •  ${doc.project?.name || 'Project'}`, 60, 125);

    // --- Metadata Section ---
    pdfDoc.moveDown(4);
    const metaY = 190;
    pdfDoc.fillColor('#334155').fontSize(12).text('DOCUMENT DETAILS', 60, metaY);
    pdfDoc.moveTo(60, metaY + 18).lineTo(535, metaY + 18).strokeColor('#e2e8f0').lineWidth(0.5).stroke();

    const metaItems = [
      ['Document Name', doc.name],
      ['Type', doc.type],
      ['Project', doc.project?.name || 'N/A'],
      ['Location', doc.project?.location || 'N/A'],
      ['Uploaded By', doc.uploadedBy],
      ['Upload Date', new Date(doc.uploadedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })],
      ['Status', doc.status],
    ];

    let y = metaY + 30;
    metaItems.forEach(([label, value]) => {
      pdfDoc.fontSize(9).fillColor('#64748b').text(label, 70, y);
      pdfDoc.fontSize(10).fillColor('#1e293b').text(value, 220, y);
      y += 22;
    });

    // --- Content Section ---
    pdfDoc.moveTo(60, y + 10).lineTo(535, y + 10).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
    y += 30;
    pdfDoc.fillColor('#334155').fontSize(12).text('DOCUMENT CONTENT', 60, y);
    y += 25;

    // Type-specific content
    const contentMap = {
      'Electrical Layout': `This document contains the single-line electrical wiring diagram covering high-voltage (HV) and low-voltage (LV) distribution panels, transformer sizing, bus-bar configurations, and circuit breaker specifications.\n\nScope:\n• Main distribution panel (MDP) — 3-phase, 415V, 50Hz\n• Sub-distribution panels (SDP) for Floors 1–12\n• Emergency generator tie-in via automatic transfer switch (ATS)\n• Cable tray routing and conduit sizing per IS 732\n• Earthing and lightning protection as per IS/IEC 62305\n\nAll layouts comply with National Electrical Code (NEC) and local municipal authority requirements.`,
      'HVAC Spec': `This HVAC ducting schematic details the air handling unit (AHU) layout, supply/return duct routes, and diffuser placements for the commercial floors.\n\nKey Specifications:\n• Cooling capacity: 450 TR (Tonnes of Refrigeration)\n• Chilled water supply/return: 6.7°C / 12.2°C\n• Fresh air intake: 15 CFM per person (ASHRAE 62.1)\n• Duct material: GI Sheet (Class 1 insulated)\n• VAV boxes on each floor for zone-level temperature control\n• Acoustic attenuation: NC-35 rating for office areas\n\nThe ducting layout has been coordinated with the structural beam grid to avoid clashes. BIM clash detection report is attached separately.`,
      'BOQ': `This Bill of Quantities (BOQ) spreadsheet provides a comprehensive cost breakdown for all civil, structural, MEP, and finishing works.\n\nSections Covered:\n• Section A — Excavation & Earthwork\n• Section B — RCC Structural Framework\n• Section C — Masonry & Blockwork\n• Section D — Plumbing & Drainage\n• Section E — Electrical & Low-Voltage Systems\n• Section F — HVAC & Fire Protection\n• Section G — Interior Finishing & Façade\n• Section H — External Development & Landscaping\n\nAll rates are as per the current Schedule of Rates (SOR) published by the Public Works Department (PWD), with contractor margin and contingency allowances.`,
      'Floor Plan': `This floor plan drawing set includes dimensioned layouts of each floor, column grid references, room numbering, and egress path markings.\n\nContents:\n• Overall building footprint with setback compliance\n• Core areas: elevator lobbies, stairwells, service shafts\n• Typical office floor plates (Floors 1–12)\n• Mechanical room, electrical room, and AHU room locations\n• Restroom layouts with accessibility compliance (ADA / NBC)\n• Partition and glazing type annotations\n\nDrawn in AutoCAD 2024 with Layer Standards per AIA CAD Layer Guidelines.`,
      '3D BIM Model': `This BIM model is an Autodesk Revit 2024 (.rvt) file containing the fully coordinated architectural, structural, and MEP models.\n\nModel Information:\n• LOD (Level of Development): 350\n• Discipline Models Federated: Architecture, Structure, MEP\n• Clash Detection: Navisworks Manage — 0 critical clashes remaining\n• IFC Export: IFC 4.0 compliant for open BIM workflows\n• Model size: 1.2 GB (shared parameters included)\n\nWorksets are organized by floor and discipline. Refer to the BIM Execution Plan (BEP) for naming conventions and revision protocols.`,
      'Structural Detail': `This structural detail drawing covers the reinforcement bar (rebar) schedule, concrete grade specifications, and connection details for the foundation and superstructure.\n\nSpecifications:\n• Concrete Grade: M40 (foundation), M35 (superstructure)\n• Rebar Grade: Fe 500D TMT bars\n• Raft Foundation: 1200mm thick, with 25mm dia bars @ 150mm c/c\n• Column sizes: 750x750mm (basement), 600x600mm (typical floors)\n• Beam depths: 600mm (primary), 450mm (secondary)\n• Cover: 50mm (foundation), 40mm (columns), 25mm (slabs)\n\nDesigned per IS 456:2000 and IS 13920 for seismic Zone IV compliance.`,
      'Specifications': `This document contains the geotechnical investigation report with soil bearing capacity analysis.\n\nTest Results Summary:\n• Safe Bearing Capacity (SBC): 22 T/m² at 3.0m depth\n• Water Table: Encountered at 4.5m below natural ground level\n• Soil Type: Silty clay (CL) with SPT N-value ranging 18–32\n• Recommended Foundation: Raft foundation on improved ground\n• Pile Option: 600mm dia bored cast-in-situ piles, if required\n\nLaboratory tests conducted: Grain size analysis, Atterberg limits, UCS, Triaxial, Consolidation.`,
      'Safety Map': `This fire evacuation route map shows primary and alternate escape routes, assembly points, fire extinguisher locations, and emergency stairwell access.\n\nCompliance Standards:\n• National Building Code (NBC) 2016 — Part 4 Fire & Life Safety\n• NFPA 101 — Life Safety Code\n• Maximum travel distance to exit: 30m (compliant)\n• Exit width: 1.2m per 100 occupants\n• Emergency lighting: 1 lux minimum on escape routes\n• Fire-rated doors: 120-minute rating on stairwell doors\n\nEvacuation drills to be conducted quarterly as per site safety plan.`,
      'Masterplan': `This overall site masterplan provides the bird's-eye layout of the entire development, including building footprints, vehicular circulation, pedestrian paths, landscaping zones, and utility infrastructure.\n\nSite Data:\n• Total Site Area: 5.2 acres (21,000 m²)\n• Built-up Area: 1,85,000 sq ft (GFA)\n• FAR Utilized: 3.8 (against permissible 4.0)\n• Ground Coverage: 48%\n• Parking Provisions: 450 cars (3 basement levels) + 80 surface\n• Green Area: 22% of site (per local planning authority requirement)\n\nThe masterplan has received preliminary approval from the Municipal Planning Authority. Final approval pending environmental clearance from the State Pollution Control Board.`,
    };

    const content = contentMap[doc.type] || `This document — "${doc.name}" — is a technical deliverable for ${doc.project?.name || 'the project'}.\n\nType: ${doc.type}\nPrepared by: ${doc.uploadedBy}\nStatus: ${doc.status}\n\nThis file was generated by ArchVoice for reference and download purposes. The original source file is maintained in the project document vault.`;

    pdfDoc.fontSize(10).fillColor('#334155').text(content, 60, y, {
      width: 475,
      lineGap: 4,
      align: 'left'
    });

    // --- Footer ---
    pdfDoc.moveDown(3);
    const footerY = pdfDoc.y + 20;
    pdfDoc.moveTo(60, footerY).lineTo(535, footerY).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
    pdfDoc.fontSize(8).fillColor('#94a3b8').text(
      `Generated by ArchVoice  •  ${new Date().toLocaleDateString('en-IN')}  •  Confidential — ${doc.project?.client || 'ArchScale'}`,
      60, footerY + 10,
      { width: 475, align: 'center' }
    );

    pdfDoc.end();
  } catch (error) {
    console.error('Document download error:', error);
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
    const { message, projectContext, userName } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message payload is required' });
    }

    // 1. Intent & Entity classification
    const intentResult = await parseIntent(message, projectContext);

    // 2. Safe Database query/mutation execution
    const executionResult = await executeAction(intentResult, message, userName);


    res.json({
      query: message,
      intent: intentResult.intent,
      entities: intentResult.entities,
      isDemoFallback: intentResult.isDemoFallback,
      response: executionResult.text,
      widgetType: executionResult.widgetType,
      widgetData: executionResult.data,
      autoDownloadDoc: executionResult.autoDownloadDoc || null
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
