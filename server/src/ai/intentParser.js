const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Super Resilient Local Fallback Parser for imperfect speech, typos, noise artifacts, and compound prompts
 */
function parseIntentFallback(text, activeProjectContext = null) {
  const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

  // 1. Fuzzy Project Extraction
  let project = null;
  if (lower.includes('alpha') || lower.includes('alfa') || lower.includes('alpa')) {
    project = 'Project Alpha';
  } else if (lower.includes('horizon') || lower.includes('horison') || lower.includes('hrizon')) {
    project = 'Project Horizon';
  } else if (lower.includes('nova') || lower.includes('noba') || lower.includes('novah')) {
    project = 'Project Nova';
  } else if (activeProjectContext && activeProjectContext !== 'All Projects') {
    project = activeProjectContext;
  }

  // 0. Greeting Detection ("hey", "hello", "hi", "good morning")
  const greetingWords = ['hey', 'hello', 'hi', 'howdy', 'greetings', 'good morning', 'good afternoon', 'good evening'];
  const trimmed = lower.trim();
  const isGreeting = greetingWords.some(g => trimmed === g || trimmed === `${g} archvoice` || trimmed.startsWith(`${g} `));
  const hasSpecificAction = lower.includes('task') || lower.includes('overdue') || lower.includes('download') || lower.includes('approval') || lower.includes('create') || lower.includes('mark') || lower.includes('remind') || lower.includes('who') || lower.includes('doc') || lower.includes('drawing');

  if (isGreeting && !hasSpecificAction) {
    return {
      intent: 'GREETING',
      entities: { project },
      isDemoFallback: true
    };
  }


  // 2. Fuzzy Person / Team Member Extraction (handles misspellings from speech-to-text)
  let person = null;
  const knownPeople = [
    { name: 'Rahul Sharma', keywords: ['rahul', 'rahool', 'rahual', 'rahal', 'sharma'] },
    { name: 'Priya Nair', keywords: ['priya', 'preeya', 'pria', 'nair'] },
    { name: 'Arjun Mehta', keywords: ['arjun', 'arjoon', 'arjun', 'mehta'] },
    { name: 'Vikram Malhotra', keywords: ['vikram', 'bikram', 'vickram', 'malhotra'] },
    { name: 'Ananya Roy', keywords: ['ananya', 'ananya', 'roy'] },
    { name: 'Raghav Verma', keywords: ['raghav', 'ragav', 'verma'] },
    { name: 'Sneha Patel', keywords: ['sneha', 'sneha', 'patel'] },
    { name: 'David Chen', keywords: ['david', 'chen'] },
    { name: 'Maria Garcia', keywords: ['maria', 'garcia'] },
    { name: 'Kabir Singh', keywords: ['kabir', 'kabir', 'singh'] }
  ];

  for (const p of knownPeople) {
    if (p.keywords.some(kw => lower.includes(kw))) {
      person = p.name;
      break;
    }
  }

  // 3. Action Extraction: CREATE_TASK
  // Handles: "create task", "add task", "assign task", "make task", "put task", "tell rahul finish electrical"
  if (
    lower.includes('create') || 
    lower.includes('add task') || 
    lower.includes('assign') || 
    lower.includes('make task') ||
    lower.includes('task for') ||
    (lower.includes('task') && (lower.includes('finish') || lower.includes('do') || lower.includes('complete')))
  ) {
    let taskTitle = 'Electrical layout drawing';

    // Extract task string
    if (lower.includes('electrical')) taskTitle = 'Finish electrical drawing';
    else if (lower.includes('hvac') || lower.includes('air conditioning')) taskTitle = 'HVAC ducting review';
    else if (lower.includes('façade') || lower.includes('facade') || lower.includes('3d')) taskTitle = '3D render refinement';
    else if (lower.includes('structural') || lower.includes('steel')) taskTitle = 'Structural beam specification';
    else {
      const match = text.match(/(?:task|action|to)\s+(.+)/i);
      if (match && match[1]) {
        taskTitle = match[1].replace(/by\s+\w+/i, '').trim();
      }
    }

    let deadline = 'Friday';
    if (lower.includes('tomorrow')) deadline = 'Tomorrow';
    else if (lower.includes('monday')) deadline = 'Monday';
    else if (lower.includes('next week')) deadline = 'Next Week';

    return {
      intent: 'CREATE_TASK',
      entities: {
        project: project || 'Project Alpha',
        person: person || 'Rahul Sharma',
        task: taskTitle,
        deadline,
        priority: lower.includes('urgent') || lower.includes('important') || lower.includes('asap') ? 'High' : 'Medium'
      },
      isDemoFallback: true
    };
  }

  // 4. Action Extraction: UPDATE_TASK
  // Handles: "mark done", "finish task", "completed", "complete hvac"
  if (lower.includes('mark') || lower.includes('finish') || lower.includes('completed') || lower.includes('complete') || lower.includes('done')) {
    let taskName = 'Electrical layout drawing';
    if (lower.includes('hvac')) taskName = 'HVAC ceiling plan & ducting';
    else if (lower.includes('facade') || lower.includes('3d')) taskName = 'Refinement of 3D façade render';

    return {
      intent: 'UPDATE_TASK',
      entities: {
        task: taskName,
        status: 'Completed'
      },
      isDemoFallback: true
    };
  }

  // 5. Action Extraction: CREATE_REMINDER
  if (lower.includes('remind') || lower.includes('reminder') || lower.includes('notify') || lower.includes('alert')) {
    return {
      intent: 'CREATE_REMINDER',
      entities: {
        project,
        person: person || 'Rahul Sharma',
        message: text
      },
      isDemoFallback: true
    };
  }

  // 6. Query: GET_OVERDUE_TASKS
  // Handles: "overdue", "over due", "delayed", "late", "behind schedule", "pending tasks overdue"
  if (lower.includes('overdue') || lower.includes('over due') || lower.includes('delayed') || lower.includes('late') || lower.includes('behind')) {
    return {
      intent: 'GET_OVERDUE_TASKS',
      entities: { project, person },
      isDemoFallback: true
    };
  }

  // 7. Query: GET_PENDING_APPROVALS
  if (lower.includes('approval') || lower.includes('approvals') || lower.includes('sign off') || lower.includes('permission')) {
    return {
      intent: 'GET_PENDING_APPROVALS',
      entities: { project },
      isDemoFallback: true
    };
  }

  // 8. Query: GET_TEAM_MEMBER / Responsibility
  // Handles: "who is responsible", "who does", "who handles", "who is assigned", "team member"
  if (lower.includes('who') || lower.includes('responsible') || lower.includes('assigned') || lower.includes('handles') || lower.includes('contact')) {
    return {
      intent: 'GET_TEAM_MEMBER',
      entities: {
        person,
        task: lower.includes('electrical') ? 'electrical' : lower.includes('hvac') ? 'hvac' : null,
        project
      },
      isDemoFallback: true
    };
  }

  // 9. Query: GET_TASKS_BY_USER
  if (person && (lower.includes('task') || lower.includes('show') || lower.includes('what'))) {
    return {
      intent: 'GET_TASKS_BY_USER',
      entities: { person, project },
      isDemoFallback: true
    };
  }

  // 10. Query: GET_DOCUMENTS / DOWNLOAD_DOCUMENT
  if (
    lower.includes('download') || 
    lower.includes('pdf') || 
    lower.includes('doc') || 
    lower.includes('drawing') || 
    lower.includes('dwg') || 
    lower.includes('file') || 
    lower.includes('boq') || 
    lower.includes('blueprint') || 
    lower.includes('schematic') ||
    lower.includes('specification') ||
    lower.includes('spec')
  ) {
    let docKeyword = null;
    if (lower.includes('hvac')) docKeyword = 'hvac';
    else if (lower.includes('electrical') || lower.includes('single line') || lower.includes('diagram')) docKeyword = 'electrical';
    else if (lower.includes('boq') || lower.includes('quantities') || lower.includes('bill')) docKeyword = 'boq';
    else if (lower.includes('structural') || lower.includes('floor plan') || lower.includes('layout')) docKeyword = 'structural';
    else if (lower.includes('bim') || lower.includes('revit')) docKeyword = 'bim';
    else if (lower.includes('soil') || lower.includes('bearing')) docKeyword = 'soil';
    else if (lower.includes('fire') || lower.includes('safety') || lower.includes('evacuation')) docKeyword = 'fire';
    else if (lower.includes('masterplan') || lower.includes('site')) docKeyword = 'masterplan';
    else if (lower.includes('first') || lower.includes('1st') || lower.includes('one')) docKeyword = 'first';
    else if (lower.includes('second') || lower.includes('2nd') || lower.includes('two')) docKeyword = 'second';
    else if (lower.includes('third') || lower.includes('3rd') || lower.includes('three')) docKeyword = 'third';
    else if (lower.includes('fourth') || lower.includes('4th') || lower.includes('four')) docKeyword = 'fourth';

    return {
      intent: 'GET_DOCUMENTS',
      entities: { 
        project,
        task: docKeyword,
        document: docKeyword
      },
      isDemoFallback: true
    };
  }



  // 11. Query: GET_RECENT_ACTIVITY
  if (lower.includes('activity') || lower.includes('change') || lower.includes('recent') || lower.includes('update')) {
    return {
      intent: 'GET_RECENT_ACTIVITY',
      entities: { project },
      isDemoFallback: true
    };
  }

  // Default: GET_PROJECT_STATUS
  return {
    intent: 'GET_PROJECT_STATUS',
    entities: { project: project || 'Project Alpha' },
    isDemoFallback: true
  };
}

/**
 * Main AI Intent & Entity extractor using Gemini LLM with robust prompt for imperfect speech
 */
async function parseIntent(userQuery, activeProjectContext = null) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return parseIntentFallback(userQuery, activeProjectContext);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
You are an ultra-forgiving AI Speech Intent & Entity Classifier for ArchVoice (AEC Architecture Assistant).
The input text comes directly from background-noisy speech-to-text with potential grammatical errors, missing punctuation, phonetic misspellings, or multiple prompts spoken together.

YOUR TASK:
Analyze the user request, ignore voice noise filler words, correct misspellings, and extract the primary intent and entities.

Allowed intents:
- GREETING: Simple friendly greeting like "hey", "hello", "hi", "good morning"
- GET_PROJECT_STATUS: Overview of project progress, metrics, or status

- GET_OVERDUE_TASKS: Overdue or delayed tasks
- GET_PENDING_APPROVALS: Drawing sign-offs, submittals, approvals
- GET_TASKS_BY_USER: Tasks assigned to a person
- GET_PROJECT_TASKS: Tasks for a project
- GET_TEAM_MEMBER: Query who is responsible for a discipline or contact info
- GET_RECENT_ACTIVITY: Site logs and recent changes
- GET_DOCUMENTS: Drawings, BOQs, floor plans, specs
- CREATE_TASK: User wants to create or assign a new task
- UPDATE_TASK: User wants to update a task status (e.g. mark done)
- CREATE_REMINDER: User wants to send a reminder or notification

Known projects: "Project Alpha", "Project Horizon", "Project Nova".
Known team members: "Rahul Sharma", "Priya Nair", "Arjun Mehta", "Vikram Malhotra", "Ananya Roy", "Raghav Verma", "Sneha Patel", "David Chen", "Maria Garcia", "Kabir Singh".

Active selected project context: "${activeProjectContext || 'All Projects'}".

Return ONLY a valid JSON object matching this schema without markdown code blocks:
{
  "intent": "<INTENT_NAME>",
  "entities": {
    "project": "<Project Name or null>",
    "person": "<Person Name or null>",
    "task": "<Task title or keywords or null>",
    "deadline": "<Deadline text or null>",
    "priority": "<High|Medium|Low|Critical or null>",
    "status": "<Status or null>"
  }
}

Raw User Speech Transcript: "${userQuery}"
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(text);
    return {
      intent: parsed.intent || 'GET_PROJECT_STATUS',
      entities: parsed.entities || {},
      isDemoFallback: false
    };

  } catch (error) {
    console.error('Gemini API fallback triggered:', error.message);
    return parseIntentFallback(userQuery, activeProjectContext);
  }
}

module.exports = {
  parseIntent,
  parseIntentFallback
};
