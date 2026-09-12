import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import ApprovalsPage from './pages/ApprovalsPage';
import TeamPage from './pages/TeamPage';
import DocumentsPage from './pages/DocumentsPage';
import ChatPanel from './components/Assistant/ChatPanel';
import AuthPage from './pages/AuthPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('archvoice_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  
  // Data state
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [team, setTeam] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [serverHealth, setServerHealth] = useState(null);
  const [triggerVoice, setTriggerVoice] = useState(false);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('archvoice_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.removeItem('archvoice_user');
    setCurrentUser(null);
  };

  // Fetch data on initial load and setup refresh helper
  const fetchData = async () => {
    try {
      const [projRes, taskRes, appRes, teamRes, docRes, actRes, healthRes] = await Promise.all([
        fetch('/api/projects').then(r => r.json()).catch(() => []),
        fetch('/api/tasks').then(r => r.json()).catch(() => []),
        fetch('/api/approvals').then(r => r.json()).catch(() => []),
        fetch('/api/team').then(r => r.json()).catch(() => []),
        fetch('/api/documents').then(r => r.json()).catch(() => []),
        fetch('/api/activity').then(r => r.json()).catch(() => []),
        fetch('/api/health').then(r => r.json()).catch(() => null)
      ]);

      setProjects(projRes || []);
      setTasks(taskRes || []);
      setApprovals(appRes || []);
      setTeam(teamRes || []);
      setDocuments(docRes || []);
      setActivities(actRes || []);
      setServerHealth(healthRes);
    } catch (e) {
      console.error('Data sync error:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handler to mark task as completed / update status
  const handleTaskUpdated = async (taskId, newStatus = 'Completed') => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (e) {
      console.error('Task update error:', e);
    }
  };

  // Handler to create new task
  const handleTaskCreated = async (taskData) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      fetchData();
    } catch (e) {
      console.error('Task create error:', e);
    }
  };

  // Handler for approvals
  const handleApprovalAction = async (approvalId, status) => {
    try {
      await fetch(`/api/approvals/${approvalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (e) {
      console.error('Approval action error:', e);
    }
  };

  // Voice shortcut trigger
  const handleOpenVoice = () => {
    setActiveTab('assistant');
    setTriggerVoice(true);
    setTimeout(() => setTriggerVoice(false), 1000);
  };

  // Compute navigation badge counts
  const overdueTasksCount = tasks.filter(
    t => t.status === 'Overdue' || (new Date(t.dueDate) < new Date() && t.status !== 'Completed')
  ).length;

  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;

  // Render Auth Login / Registration Page if not logged in
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f19]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={{
          overdueTasks: overdueTasksCount,
          pendingApprovals: pendingApprovalsCount
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <Header
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          onOpenVoice={handleOpenVoice}
          serverHealth={serverHealth}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* View Router */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'dashboard' && (
            <DashboardPage
              projects={projects}
              tasks={tasks}
              approvals={approvals}
              activities={activities}
              selectedProject={selectedProject}
              onNavigateTab={setActiveTab}
              onOpenVoice={handleOpenVoice}
              onTaskUpdated={handleTaskUpdated}
            />
          )}

          {activeTab === 'assistant' && (
            <ChatPanel
              selectedProject={selectedProject}
              onTaskUpdated={fetchData}
              onNavigateTab={setActiveTab}
              triggerVoiceOnLoad={triggerVoice}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsPage projects={projects} />
          )}

          {activeTab === 'tasks' && (
            <TasksPage
              tasks={tasks}
              projects={projects}
              onTaskUpdated={handleTaskUpdated}
              onTaskCreated={handleTaskCreated}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsPage
              approvals={approvals}
              onApprovalAction={handleApprovalAction}
            />
          )}

          {activeTab === 'team' && (
            <TeamPage team={team} />
          )}

          {activeTab === 'documents' && (
            <DocumentsPage documents={documents} />
          )}
        </main>
      </div>
    </div>
  );
}
