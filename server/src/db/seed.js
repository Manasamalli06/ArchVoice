const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AEC database for ArchVoice...');

  // Clean existing data
  await prisma.reminder.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.document.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Rahul Sharma',
        role: 'Electrical Engineer',
        email: 'rahul.sharma@archscale.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Priya Nair',
        role: 'HVAC & MEP Lead',
        email: 'priya.nair@archscale.com',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Arjun Mehta',
        role: 'Principal Architect',
        email: 'arjun.mehta@archscale.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Vikram Malhotra',
        role: 'Structural Engineer',
        email: 'vikram.malhotra@archscale.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ananya Roy',
        role: 'Interior Architect',
        email: 'ananya.roy@archscale.com',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Raghav Verma',
        role: 'Site Supervisor',
        email: 'raghav.verma@archscale.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sneha Patel',
        role: 'BIM Coordinator',
        email: 'sneha.patel@archscale.com',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      },
    }),
    prisma.user.create({
      data: {
        name: 'David Chen',
        role: 'Project Manager',
        email: 'david.chen@archscale.com',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Maria Garcia',
        role: 'Safety Inspector',
        email: 'maria.garcia@archscale.com',
        avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=150',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Kabir Singh',
        role: 'Civil Construction Lead',
        email: 'kabir.singh@archscale.com',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      },
    }),
  ]);

  // Create Projects
  const projectAlpha = await prisma.project.create({
    data: {
      name: 'Project Alpha',
      client: 'Apex Dynamics Inc.',
      location: 'Austin Downtown Financial District',
      status: 'In Progress',
      progress: 72,
      startDate: new Date('2026-01-10'),
      dueDate: new Date('2026-11-30'),
    },
  });

  const projectHorizon = await prisma.project.create({
    data: {
      name: 'Project Horizon',
      client: 'Horizon Realty Corp',
      location: 'Westside Waterfront Plaza',
      status: 'In Progress',
      progress: 45,
      startDate: new Date('2026-03-01'),
      dueDate: new Date('2027-02-15'),
    },
  });

  const projectNova = await prisma.project.create({
    data: {
      name: 'Project Nova',
      client: 'Nova Retail Group',
      location: 'North District Metro Hub',
      status: 'In Progress',
      progress: 88,
      startDate: new Date('2025-09-01'),
      dueDate: new Date('2026-10-15'),
    },
  });

  const now = new Date();
  const pastDays = (d) => new Date(now.getTime() - d * 86400000);
  const futureDays = (d) => new Date(now.getTime() + d * 86400000);

  // Create Tasks
  const tasks = await Promise.all([
    // Project Alpha tasks
    prisma.task.create({
      data: {
        title: 'Electrical layout drawing',
        description: 'Complete high-voltage and low-voltage single-line wiring diagrams for Floors 1-12.',
        projectId: projectAlpha.id,
        assignedTo: 'Rahul Sharma',
        status: 'Overdue',
        priority: 'High',
        dueDate: pastDays(2),
      },
    }),
    prisma.task.create({
      data: {
        title: 'HVAC ceiling plan & ducting',
        description: 'Finalize duct routes and acoustic baffle placements for the central atrium.',
        projectId: projectAlpha.id,
        assignedTo: 'Priya Nair',
        status: 'Overdue',
        priority: 'Critical',
        dueDate: pastDays(4),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Refinement of 3D façade render',
        description: 'Adjust glass curtain reflectivity and exterior louvers lighting in V-Ray render.',
        projectId: projectAlpha.id,
        assignedTo: 'Arjun Mehta',
        status: 'Overdue',
        priority: 'Medium',
        dueDate: pastDays(1),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Plumbing schematic review',
        description: 'Review riser diagrams and greywater recycling pump sizing with city water authority.',
        projectId: projectAlpha.id,
        assignedTo: 'Priya Nair',
        status: 'Pending',
        priority: 'Medium',
        dueDate: futureDays(5),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Fire safety sprinkler layout',
        description: 'Cross-check sprinkler density compliance against NFPA 13 standards.',
        projectId: projectAlpha.id,
        assignedTo: 'Maria Garcia',
        status: 'Pending',
        priority: 'High',
        dueDate: futureDays(3),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Civil drainage grid design',
        description: 'Stormwater catchment capacity calculations for sub-basement sump systems.',
        projectId: projectAlpha.id,
        assignedTo: 'Kabir Singh',
        status: 'Pending',
        priority: 'Low',
        dueDate: futureDays(8),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Acoustic panel specification for auditorium',
        description: 'Select NRC rated fabric panels for multi-purpose convention floor.',
        projectId: projectAlpha.id,
        assignedTo: 'Ananya Roy',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: futureDays(6),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Solar panel mounting structure review',
        description: 'Structural payload audit for rooftop photovoltaic arrays.',
        projectId: projectAlpha.id,
        assignedTo: 'Vikram Malhotra',
        status: 'Completed',
        priority: 'Medium',
        dueDate: pastDays(7),
      },
    }),

    // Project Horizon tasks
    prisma.task.create({
      data: {
        title: 'Structural steel beam specification',
        description: 'Calculate shear strain for transfer girder at Level 4 podium.',
        projectId: projectHorizon.id,
        assignedTo: 'Vikram Malhotra',
        status: 'Overdue',
        priority: 'Critical',
        dueDate: pastDays(3),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Elevator shaft elevation drawings',
        description: 'Coordinate high-speed traction elevator pit dimensions with Schindler vendor.',
        projectId: projectHorizon.id,
        assignedTo: 'Sneha Patel',
        status: 'Pending',
        priority: 'High',
        dueDate: futureDays(4),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Interior finishes & lighting schedule',
        description: 'Specify timber wall cladding and ambient LED recessed track lights.',
        projectId: projectHorizon.id,
        assignedTo: 'Ananya Roy',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: futureDays(9),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Emergency exit stairwell details',
        description: 'Fire doors rating and pressurization shaft detailing.',
        projectId: projectHorizon.id,
        assignedTo: 'Arjun Mehta',
        status: 'Pending',
        priority: 'High',
        dueDate: futureDays(2),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Basement parking ventilation layout',
        description: 'Jet fan placement for CO exhaust extraction in Level B2 parking.',
        projectId: projectHorizon.id,
        assignedTo: 'Priya Nair',
        status: 'Pending',
        priority: 'Medium',
        dueDate: futureDays(7),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Substation high-voltage wiring scheme',
        description: '11kV grid tie-in schematic submission to local utility provider.',
        projectId: projectHorizon.id,
        assignedTo: 'Rahul Sharma',
        status: 'Pending',
        priority: 'Critical',
        dueDate: futureDays(5),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Foundation concrete pour quality check',
        description: 'Core compression test results validation for raft foundation.',
        projectId: projectHorizon.id,
        assignedTo: 'Raghav Verma',
        status: 'Completed',
        priority: 'High',
        dueDate: pastDays(10),
      },
    }),

    // Project Nova tasks
    prisma.task.create({
      data: {
        title: 'Anchor store HVAC load calculation',
        description: 'Chilled water tonnage requirements for 50,000 sq ft hypermarket area.',
        projectId: projectNova.id,
        assignedTo: 'Priya Nair',
        status: 'Overdue',
        priority: 'High',
        dueDate: pastDays(5),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Main lobby marble flooring mockups',
        description: 'Inspect Italian Calacatta marble slab veins and anti-slip sealant.',
        projectId: projectNova.id,
        assignedTo: 'Ananya Roy',
        status: 'Pending',
        priority: 'Medium',
        dueDate: futureDays(2),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Site electrical transformer installation',
        description: 'Commissioning step 2 for 2500 kVA step-down transformer.',
        projectId: projectNova.id,
        assignedTo: 'Rahul Sharma',
        status: 'In Progress',
        priority: 'High',
        dueDate: futureDays(3),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Exterior curtain wall thermal analysis',
        description: 'Double-glazed Low-E glass U-value compliance verification.',
        projectId: projectNova.id,
        assignedTo: 'Vikram Malhotra',
        status: 'Pending',
        priority: 'Low',
        dueDate: futureDays(10),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Retail tenant storefront guidelines',
        description: 'Publish signage height and shopfront structural interface criteria.',
        projectId: projectNova.id,
        assignedTo: 'Arjun Mehta',
        status: 'Completed',
        priority: 'Medium',
        dueDate: pastDays(8),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Roof waterproof membrane inspection',
        description: 'Flood test on 4,000 sqm elastomeric membrane rooftop deck.',
        projectId: projectNova.id,
        assignedTo: 'Maria Garcia',
        status: 'Completed',
        priority: 'High',
        dueDate: pastDays(12),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Site perimeter fencing & security gates',
        description: 'Automated turnstile and booming barrier installation.',
        projectId: projectNova.id,
        assignedTo: 'Raghav Verma',
        status: 'Completed',
        priority: 'Low',
        dueDate: pastDays(15),
      },
    }),
  ]);

  // Create Approvals
  await Promise.all([
    prisma.approval.create({
      data: {
        title: 'MEP Drawing Sign-off (Rev B)',
        projectId: projectAlpha.id,
        requestedBy: 'Priya Nair',
        status: 'Pending',
        dueDate: futureDays(2),
      },
    }),
    prisma.approval.create({
      data: {
        title: 'Façade Material Sample Sign-off',
        projectId: projectAlpha.id,
        requestedBy: 'Arjun Mehta',
        status: 'Pending',
        dueDate: futureDays(4),
      },
    }),
    prisma.approval.create({
      data: {
        title: 'Fire Safety Compliance Certificate',
        projectId: projectAlpha.id,
        requestedBy: 'Maria Garcia',
        status: 'Pending',
        dueDate: futureDays(5),
      },
    }),
    prisma.approval.create({
      data: {
        title: 'Electrical Panel Fabrication Clearance',
        projectId: projectAlpha.id,
        requestedBy: 'Rahul Sharma',
        status: 'Pending',
        dueDate: futureDays(1),
      },
    }),
    prisma.approval.create({
      data: {
        title: 'Structural Load Calculations Approval',
        projectId: projectHorizon.id,
        requestedBy: 'Vikram Malhotra',
        status: 'Pending',
        dueDate: futureDays(3),
      },
    }),
    prisma.approval.create({
      data: {
        title: 'Podium Glazing Structural Design',
        projectId: projectHorizon.id,
        requestedBy: 'Arjun Mehta',
        status: 'Pending',
        dueDate: futureDays(6),
      },
    }),
    prisma.approval.create({
      data: {
        title: 'HVAC Chiller Unit Procurement Approval',
        projectId: projectNova.id,
        requestedBy: 'Priya Nair',
        status: 'Approved',
        dueDate: pastDays(3),
      },
    }),
    prisma.approval.create({
      data: {
        title: 'Tenant Design Manual Approval',
        projectId: projectNova.id,
        requestedBy: 'Arjun Mehta',
        status: 'Approved',
        dueDate: pastDays(6),
      },
    }),
    prisma.approval.create({
      data: {
        title: 'Soil Testing Report Approval',
        projectId: projectHorizon.id,
        requestedBy: 'Kabir Singh',
        status: 'Approved',
        dueDate: pastDays(14),
      },
    }),
  ]);

  // Create Documents
  await Promise.all([
    prisma.document.create({
      data: {
        name: 'Electrical_Single_Line_Diagram_v4.dwg',
        projectId: projectAlpha.id,
        type: 'Electrical Layout',
        uploadedBy: 'Rahul Sharma',
        status: 'Under Review',
      },
    }),
    prisma.document.create({
      data: {
        name: 'HVAC_Ducting_Schematic_Rev2.pdf',
        projectId: projectAlpha.id,
        type: 'HVAC Spec',
        uploadedBy: 'Priya Nair',
        status: 'Under Review',
      },
    }),
    prisma.document.create({
      data: {
        name: 'Bill_of_Quantities_Q3_Alpha.xlsx',
        projectId: projectAlpha.id,
        type: 'BOQ',
        uploadedBy: 'David Chen',
        status: 'Approved',
      },
    }),
    prisma.document.create({
      data: {
        name: 'Structural_Layout_Floor1-12.dwg',
        projectId: projectAlpha.id,
        type: 'Floor Plan',
        uploadedBy: 'Vikram Malhotra',
        status: 'Approved',
      },
    }),
    prisma.document.create({
      data: {
        name: 'Architectural_BIM_Model_Level15.rvt',
        projectId: projectHorizon.id,
        type: '3D BIM Model',
        uploadedBy: 'Sneha Patel',
        status: 'Under Review',
      },
    }),
    prisma.document.create({
      data: {
        name: 'Foundation_Reinforcement_Detail.pdf',
        projectId: projectHorizon.id,
        type: 'Structural Detail',
        uploadedBy: 'Vikram Malhotra',
        status: 'Approved',
      },
    }),
    prisma.document.create({
      data: {
        name: 'Soil_Bearing_Capacity_Report.pdf',
        projectId: projectHorizon.id,
        type: 'Specifications',
        uploadedBy: 'Kabir Singh',
        status: 'Approved',
      },
    }),
    prisma.document.create({
      data: {
        name: 'Retail_Lobby_Interior_Renders.zip',
        projectId: projectNova.id,
        type: 'Floor Plan',
        uploadedBy: 'Ananya Roy',
        status: 'Approved',
      },
    }),
    prisma.document.create({
      data: {
        name: 'Fire_Evacuation_Route_Map.dwg',
        projectId: projectNova.id,
        type: 'Safety Map',
        uploadedBy: 'Maria Garcia',
        status: 'Approved',
      },
    }),
    prisma.document.create({
      data: {
        name: 'Overall_Site_Masterplan_2026.pdf',
        projectId: projectNova.id,
        type: 'Masterplan',
        uploadedBy: 'Arjun Mehta',
        status: 'Approved',
      },
    }),
  ]);

  // Create Activity Logs
  await Promise.all([
    prisma.activity.create({
      data: {
        message: 'Electrical layout drawing flagged as OVERDUE for Project Alpha.',
        projectId: projectAlpha.id,
        createdAt: pastDays(1),
      },
    }),
    prisma.activity.create({
      data: {
        message: 'Priya Nair requested MEP Drawing Sign-off (Rev B) approval.',
        projectId: projectAlpha.id,
        createdAt: pastDays(2),
      },
    }),
    prisma.activity.create({
      data: {
        message: 'Vikram Malhotra updated status of Structural Steel Beam specification to Critical Overdue.',
        projectId: projectHorizon.id,
        createdAt: pastDays(2),
      },
    }),
    prisma.activity.create({
      data: {
        message: 'HVAC Chiller Unit Procurement Approval marked as APPROVED by David Chen.',
        projectId: projectNova.id,
        createdAt: pastDays(3),
      },
    }),
    prisma.activity.create({
      data: {
        message: 'New document Electrical_Single_Line_Diagram_v4.dwg uploaded by Rahul Sharma.',
        projectId: projectAlpha.id,
        createdAt: pastDays(3),
      },
    }),
    prisma.activity.create({
      data: {
        message: 'Foundation concrete pour quality check completed on Project Horizon.',
        projectId: projectHorizon.id,
        createdAt: pastDays(4),
      },
    }),
    prisma.activity.create({
      data: {
        message: 'Project Nova reached 88% overall construction completion.',
        projectId: projectNova.id,
        createdAt: pastDays(5),
      },
    }),
  ]);

  console.log('✅ Seed completed successfully with 3 projects, 10 team members, 22 tasks, 9 approvals, 10 documents, and activity logs!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
