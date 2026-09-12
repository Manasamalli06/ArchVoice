const prisma = require('../db/prisma');

/**
 * Executes database operations based on structured AI intents and formats rich visual response widgets
 */
async function executeAction(intentResult, userQuery) {
  const { intent, entities, isDemoFallback } = intentResult;
  const projectFilter = entities.project;
  const personFilter = entities.person;

  let projectObj = null;
  if (projectFilter) {
    projectObj = await prisma.project.findFirst({
      where: {
        name: {
          contains: projectFilter
        }
      }
    });
  }

  const projectId = projectObj ? projectObj.id : null;

  switch (intent) {
    case 'GET_PROJECT_STATUS': {
      let projects = [];
      if (projectId) {
        projects = [await prisma.project.findUnique({
          where: { id: projectId },
          include: {
            tasks: true,
            approvals: true,
            documents: true
          }
        })];
      } else {
        projects = await prisma.project.findMany({
          include: {
            tasks: true,
            approvals: true,
            documents: true
          }
        });
      }

      if (!projects.length) {
        return {
          intent,
          text: `I couldn't find project records matching "${projectFilter || 'the requested query'}".`,
          widgetType: 'TEXT',
          data: null,
          isDemoFallback
        };
      }

      const p = projects[0];
      const overdueCount = p.tasks.filter(t => t.status === 'Overdue' || (new Date(t.dueDate) < new Date() && t.status !== 'Completed')).length;
      const pendingTasks = p.tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
      const pendingApprovals = p.approvals.filter(a => a.status === 'Pending').length;

      const text = `${p.name} (${p.client}) is currently at ${p.progress}% progress. It has ${pendingTasks} active tasks, ${overdueCount} overdue items, and ${pendingApprovals} pending drawing sign-offs. Target completion date is ${new Date(p.dueDate).toLocaleDateString()}.`;

      return {
        intent,
        text,
        widgetType: 'PROJECT_SUMMARY',
        data: {
          project: p,
          stats: {
            progress: p.progress,
            totalTasks: p.tasks.length,
            pendingTasks,
            overdueCount,
            pendingApprovals,
            totalDocuments: p.documents.length
          }
        },
        isDemoFallback
      };
    }

    case 'GET_OVERDUE_TASKS': {
      const whereClause = {
        OR: [
          { status: 'Overdue' },
          {
            AND: [
              { dueDate: { lt: new Date() } },
              { status: { not: 'Completed' } }
            ]
          }
        ]
      };

      if (projectId) {
        whereClause.projectId = projectId;
      }

      const overdueTasks = await prisma.task.findMany({
        where: whereClause,
        include: { project: true },
        orderBy: { dueDate: 'asc' }
      });

      if (overdueTasks.length === 0) {
        return {
          intent,
          text: `Great news! There are currently no overdue tasks ${projectObj ? 'for ' + projectObj.name : 'across any active projects'}.`,
          widgetType: 'TEXT',
          data: [],
          isDemoFallback
        };
      }

      const pName = projectObj ? projectObj.name : 'All Projects';
      const textList = overdueTasks.slice(0, 3).map((t, idx) => {
        const days = Math.max(1, Math.round((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24)));
        return `${idx + 1}. ${t.title} — ${t.assignedTo} (${days} ${days === 1 ? 'day' : 'days'} overdue)`;
      }).join('\n');

      const responseText = `${pName} has ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}:\n\n${textList}`;

      return {
        intent,
        text: responseText,
        widgetType: 'TASK_LIST',
        data: overdueTasks,
        isDemoFallback
      };
    }

    case 'GET_PENDING_APPROVALS': {
      const whereClause = { status: 'Pending' };
      if (projectId) whereClause.projectId = projectId;

      const approvals = await prisma.approval.findMany({
        where: whereClause,
        include: { project: true },
        orderBy: { dueDate: 'asc' }
      });

      if (approvals.length === 0) {
        return {
          intent,
          text: `There are currently no pending approvals ${projectObj ? 'for ' + projectObj.name : ''}.`,
          widgetType: 'TEXT',
          data: [],
          isDemoFallback
        };
      }

      const textList = approvals.map(a => `• ${a.title} (Requested by ${a.requestedBy}, Project: ${a.project.name})`).join('\n');
      const text = `There are ${approvals.length} pending drawing and specification sign-offs:\n\n${textList}`;

      return {
        intent,
        text,
        widgetType: 'APPROVAL_LIST',
        data: approvals,
        isDemoFallback
      };
    }

    case 'GET_TASKS_BY_USER': {
      const targetName = personFilter || 'Rahul Sharma';
      const userTasks = await prisma.task.findMany({
        where: {
          assignedTo: {
            contains: targetName.split(' ')[0]
          }
        },
        include: { project: true },
        orderBy: { dueDate: 'asc' }
      });

      if (userTasks.length === 0) {
        return {
          intent,
          text: `No assigned tasks found for ${targetName}.`,
          widgetType: 'TEXT',
          data: [],
          isDemoFallback
        };
      }

      const overdue = userTasks.filter(t => t.status === 'Overdue').length;
      const text = `${targetName} is currently assigned ${userTasks.length} task${userTasks.length > 1 ? 's' : ''} (${overdue} overdue):`;

      return {
        intent,
        text,
        widgetType: 'TASK_LIST',
        data: userTasks,
        isDemoFallback
      };
    }

    case 'GET_TEAM_MEMBER': {
      let user = null;
      if (personFilter) {
        user = await prisma.user.findFirst({
          where: {
            name: { contains: personFilter.split(' ')[0] }
          }
        });
      }

      if (!user) {
        // Try searching by task or discipline
        if (userQuery.toLowerCase().includes('electrical')) {
          user = await prisma.user.findFirst({ where: { role: { contains: 'Electrical' } } });
        } else if (userQuery.toLowerCase().includes('hvac') || userQuery.toLowerCase().includes('mep')) {
          user = await prisma.user.findFirst({ where: { role: { contains: 'HVAC' } } });
        } else if (userQuery.toLowerCase().includes('architect')) {
          user = await prisma.user.findFirst({ where: { role: { contains: 'Architect' } } });
        } else if (userQuery.toLowerCase().includes('structural')) {
          user = await prisma.user.findFirst({ where: { role: { contains: 'Structural' } } });
        }
      }

      if (!user) {
        user = await prisma.user.findFirst({ where: { name: 'Rahul Sharma' } });
      }

      const userTasks = await prisma.task.findMany({
        where: { assignedTo: user.name }
      });

      const text = `${user.name} is the ${user.role} on the project team. Email: ${user.email}. They are currently assigned ${userTasks.length} tasks.`;

      return {
        intent,
        text,
        widgetType: 'TEAM_CARD',
        data: { user, tasks: userTasks },
        isDemoFallback
      };
    }

    case 'CREATE_TASK': {
      const taskTitle = entities.task || 'Finish electrical drawing';
      const assignee = entities.person || 'Rahul Sharma';
      const deadlineStr = entities.deadline || 'Friday';
      
      // Select appropriate project (default to Project Alpha if not matched)
      const targetProj = projectObj || await prisma.project.findFirst({ where: { name: 'Project Alpha' } });

      // Calculate realistic due date from deadline string
      let dueDate = new Date();
      if (deadlineStr.toLowerCase() === 'tomorrow') {
        dueDate.setDate(dueDate.getDate() + 1);
      } else if (deadlineStr.toLowerCase() === 'friday') {
        const day = dueDate.getDay();
        const diff = (5 - day + 7) % 7 || 7;
        dueDate.setDate(dueDate.getDate() + diff);
      } else {
        dueDate.setDate(dueDate.getDate() + 3);
      }

      // Create Task in SQLite via Prisma
      const newTask = await prisma.task.create({
        data: {
          title: taskTitle,
          description: `Created via ArchVoice Assistant for ${targetProj.name}.`,
          projectId: targetProj.id,
          assignedTo: assignee,
          status: 'Pending',
          priority: entities.priority || 'High',
          dueDate
        },
        include: { project: true }
      });

      // Add to Activity Log
      await prisma.activity.create({
        data: {
          message: `Created task "${newTask.title}" assigned to ${assignee} via AI Assistant.`,
          projectId: targetProj.id
        }
      });

      const responseText = `Done! I created the task "${newTask.title}" and assigned it to ${assignee} with a ${deadlineStr} deadline for ${targetProj.name}.`;

      return {
        intent,
        text: responseText,
        widgetType: 'ACTION_CONFIRMATION',
        data: {
          action: 'CREATE_TASK',
          task: newTask,
          message: `Task "${newTask.title}" created successfully!`
        },
        isDemoFallback
      };
    }

    case 'UPDATE_TASK': {
      const taskQuery = entities.task || 'Electrical layout';
      const newStatus = entities.status || 'Completed';

      // Find matching task
      const taskToUpdate = await prisma.task.findFirst({
        where: {
          title: { contains: taskQuery }
        },
        include: { project: true }
      });

      if (!taskToUpdate) {
        return {
          intent,
          text: `I couldn't find an open task matching "${taskQuery}" to update.`,
          widgetType: 'TEXT',
          data: null,
          isDemoFallback
        };
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskToUpdate.id },
        data: { status: newStatus },
        include: { project: true }
      });

      await prisma.activity.create({
        data: {
          message: `Updated task "${updatedTask.title}" status to ${newStatus}.`,
          projectId: updatedTask.projectId
        }
      });

      const responseText = `Updated! Marked task "${updatedTask.title}" as ${newStatus} for ${updatedTask.project.name}.`;

      return {
        intent,
        text: responseText,
        widgetType: 'ACTION_CONFIRMATION',
        data: {
          action: 'UPDATE_TASK',
          task: updatedTask,
          message: `Task status updated to ${newStatus}.`
        },
        isDemoFallback
      };
    }

    case 'CREATE_REMINDER': {
      const recipient = entities.person || 'Rahul Sharma';
      const message = `Reminder about overdue AEC task items for ${projectObj ? projectObj.name : 'Project Alpha'}`;

      const reminder = await prisma.reminder.create({
        data: {
          recipient,
          message,
          status: 'Sent'
        }
      });

      await prisma.activity.create({
        data: {
          message: `Sent high-priority reminder to ${recipient}.`,
          projectId: projectId || (await prisma.project.findFirst()).id
        }
      });

      const responseText = `Reminder dispatched to ${recipient}! Sent message: "${message}".`;

      return {
        intent,
        text: responseText,
        widgetType: 'ACTION_CONFIRMATION',
        data: {
          action: 'CREATE_REMINDER',
          reminder,
          message: `Reminder successfully sent to ${recipient}.`
        },
        isDemoFallback
      };
    }

    case 'GET_RECENT_ACTIVITY': {
      const whereClause = {};
      if (projectId) whereClause.projectId = projectId;

      const activities = await prisma.activity.findMany({
        where: whereClause,
        include: { project: true },
        orderBy: { createdAt: 'desc' },
        take: 8
      });

      const text = `Here are the latest updates and site activity logs ${projectObj ? 'for ' + projectObj.name : 'across all projects'}:`;

      return {
        intent,
        text,
        widgetType: 'ACTIVITY_LIST',
        data: activities,
        isDemoFallback
      };
    }

    case 'GET_DOCUMENTS': {
      const whereClause = {};
      if (projectId) whereClause.projectId = projectId;

      const docs = await prisma.document.findMany({
        where: whereClause,
        include: { project: true },
        orderBy: { uploadedAt: 'desc' }
      });

      const text = `Found ${docs.length} drawing and specification documents ${projectObj ? 'for ' + projectObj.name : ''}:`;

      return {
        intent,
        text,
        widgetType: 'DOCUMENT_LIST',
        data: docs,
        isDemoFallback
      };
    }

    default: {
      const tasks = await prisma.task.findMany({ take: 3, include: { project: true } });
      return {
        intent: 'UNKNOWN',
        text: `I'm tracking all your AEC project details! You can ask me about overdue tasks, pending approvals, project progress, or tell me to create a task for a team member.`,
        widgetType: 'TASK_LIST',
        data: tasks,
        isDemoFallback
      };
    }
  }
}

module.exports = {
  executeAction
};
