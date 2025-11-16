import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ArrowLeft, Edit2, Plus, Trash2, LogOut } from "lucide-react";
import { useUser } from "@/UserContext";
import { Login } from "@/Login";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Axios interceptor to add headers
axios.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const org = JSON.parse(localStorage.getItem('currentOrganization') || 'null');
  
  if (user) {
    config.headers['X-User-Name'] = user.name;
    config.headers['X-User-Role'] = user.role;
  }
  if (org) {
    config.headers['X-Organization-ID'] = org.id;
  } else {
    config.headers['X-Organization-ID'] = 'null';
  }
  
  return config;
});

const Sidebar = () => {
  const { currentUser, currentOrganization, logout, canAccessTab } = useUser();

  return (
    <div className="sidebar" data-testid="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">TaskFlow</h2>
        <p className="sidebar-subtitle">{currentOrganization?.name || 'Project Management'}</p>
        <div className="user-info">
          <p className="user-name">{currentUser?.name}</p>
          <p className="user-role">{currentUser?.role}</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        <Link to="/" className="nav-link" data-testid="nav-dashboard">
          <span className="nav-icon">📊</span>
          Dashboard
        </Link>
        {canAccessTab('projects') && (
          <Link to="/projects" className="nav-link" data-testid="nav-projects">
            <span className="nav-icon">📁</span>
            Projects
          </Link>
        )}
        {canAccessTab('kanban') && (
          <Link to="/kanban" className="nav-link" data-testid="nav-kanban">
            <span className="nav-icon">🎯</span>
            Kanban Board
          </Link>
        )}
        {canAccessTab('todo') && (
          <Link to="/todo" className="nav-link" data-testid="nav-todo">
            <span className="nav-icon">✓</span>
            TODO List
          </Link>
        )}
        {canAccessTab('weekly') && (
          <Link to="/weekly" className="nav-link" data-testid="nav-weekly">
            <span className="nav-icon">📅</span>
            Weekly Summary
          </Link>
        )}
        {canAccessTab('team') && (
          <Link to="/team" className="nav-link" data-testid="nav-team">
            <span className="nav-icon">👥</span>
            Team
          </Link>
        )}
        {canAccessTab('departments') && (
          <Link to="/departments" className="nav-link" data-testid="nav-departments">
            <span className="nav-icon">🏢</span>
            Departments
          </Link>
        )}
        {canAccessTab('performance') && (
          <Link to="/performance" className="nav-link" data-testid="nav-performance">
            <span className="nav-icon">📈</span>
            Performance
          </Link>
        )}
        {canAccessTab('organizations') && (
          <Link to="/organizations" className="nav-link" data-testid="nav-organizations">
            <span className="nav-icon">🌐</span>
            Organizations
          </Link>
        )}
      </nav>
      <div className="sidebar-footer">
        <Button
          variant="ghost"
          className="logout-button"
          onClick={logout}
          data-testid="logout-button"
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (e) {
      console.error("Error fetching stats:", e);
      toast.error("Failed to load dashboard stats");
    }
  };

  if (!stats) return <div className="loading" data-testid="loading">Loading...</div>;

  return (
    <div className="page-container" data-testid="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your projects and tasks</p>
      </div>

      <div className="stats-grid">
        <Card className="stat-card" data-testid="stat-projects">
          <CardHeader>
            <CardTitle className="stat-value">{stats.total_projects}</CardTitle>
            <CardDescription>Total Projects</CardDescription>
          </CardHeader>
        </Card>
        <Card className="stat-card" data-testid="stat-tasks">
          <CardHeader>
            <CardTitle className="stat-value">{stats.total_tasks}</CardTitle>
            <CardDescription>Total Tasks</CardDescription>
          </CardHeader>
        </Card>
        <Card className="stat-card" data-testid="stat-stories">
          <CardHeader>
            <CardTitle className="stat-value">{stats.total_stories}</CardTitle>
            <CardDescription>Total Stories</CardDescription>
          </CardHeader>
        </Card>
        <Card className="stat-card" data-testid="stat-members">
          <CardHeader>
            <CardTitle className="stat-value">{stats.total_members}</CardTitle>
            <CardDescription>Team Members</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="charts-grid">
        <Card data-testid="task-breakdown-card">
          <CardHeader>
            <CardTitle>Task Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="breakdown-list">
              <div className="breakdown-item">
                <span className="breakdown-label">TODO</span>
                <span className="breakdown-value todo-badge">{stats.task_breakdown.todo}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">In Progress</span>
                <span className="breakdown-value progress-badge">{stats.task_breakdown.in_progress}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">In Review</span>
                <span className="breakdown-value review-badge">{stats.task_breakdown.in_review}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Done</span>
                <span className="breakdown-value done-badge">{stats.task_breakdown.done}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="priority-breakdown-card">
          <CardHeader>
            <CardTitle>Priority Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="breakdown-list">
              <div className="breakdown-item">
                <span className="breakdown-label">High Priority</span>
                <span className="breakdown-value high-priority-badge">{stats.priority_breakdown.high}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Critical Priority</span>
                <span className="breakdown-value critical-priority-badge">{stats.priority_breakdown.critical}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="quick-actions">
        <Button onClick={() => navigate('/projects')} data-testid="quick-create-project">Create Project</Button>
        <Button onClick={() => navigate('/kanban')} variant="outline" data-testid="quick-view-kanban">View Kanban</Button>
      </div>
    </div>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showStoryDialog, setShowStoryDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [storyForm, setStoryForm] = useState({ title: "", description: "", brd: "", prd: "", priority: "Medium" });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    story_id: "",
    assigned_to: "",
    start_date: "",
    end_date: "",
    target_date: "",
    story_points: "",
    priority: "Medium",
    type: "Task",
    team: "Development"
  });

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchStories(selectedProject.id);
      fetchTasks(selectedProject.id);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
      if (response.data.length > 0 && !selectedProject) {
        setSelectedProject(response.data[0]);
      }
    } catch (e) {
      console.error("Error fetching projects:", e);
    }
  };

  const fetchStories = async (projectId) => {
    try {
      const response = await axios.get(`${API}/stories?project_id=${projectId}`);
      setStories(response.data);
    } catch (e) {
      console.error("Error fetching stories:", e);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const response = await axios.get(`${API}/tasks?project_id=${projectId}`);
      setTasks(response.data);
    } catch (e) {
      console.error("Error fetching tasks:", e);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${API}/team`);
      setTeamMembers(response.data);
    } catch (e) {
      console.error("Error fetching team members:", e);
    }
  };

  const createProject = async () => {
    try {
      await axios.post(`${API}/projects`, projectForm);
      toast.success("Project created successfully");
      setShowProjectDialog(false);
      setProjectForm({ name: "", description: "" });
      fetchProjects();
    } catch (e) {
      console.error("Error creating project:", e);
      toast.error("Failed to create project");
    }
  };

  const createStory = async () => {
    if (!selectedProject) return;
    try {
      await axios.post(`${API}/stories`, { ...storyForm, project_id: selectedProject.id });
      toast.success("Story created successfully");
      setShowStoryDialog(false);
      setStoryForm({ title: "", description: "", brd: "", prd: "", priority: "Medium" });
      fetchStories(selectedProject.id);
    } catch (e) {
      console.error("Error creating story:", e);
      toast.error("Failed to create story");
    }
  };

  const createTask = async () => {
    if (!selectedProject) return;
    try {
      await axios.post(`${API}/tasks`, { ...taskForm, project_id: selectedProject.id });
      toast.success("Task created successfully");
      setShowTaskDialog(false);
      setTaskForm({
        title: "",
        description: "",
        story_id: "",
        assigned_to: "",
        start_date: "",
        end_date: "",
        target_date: "",
        story_points: "",
        priority: "Medium",
        type: "Task",
        team: "Development"
      });
      fetchTasks(selectedProject.id);
    } catch (e) {
      console.error("Error creating task:", e);
      toast.error("Failed to create task");
    }
  };

  return (
    <div className="page-container" data-testid="projects-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your projects, stories, and tasks</p>
        </div>
        <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
          <DialogTrigger asChild>
            <Button data-testid="create-project-btn">+ New Project</Button>
          </DialogTrigger>
          <DialogContent data-testid="project-dialog">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a new project to organize your work</DialogDescription>
            </DialogHeader>
            <div className="form-group">
              <Label>Project Name</Label>
              <Input
                data-testid="project-name-input"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            <div className="form-group">
              <Label>Description</Label>
              <Textarea
                data-testid="project-description-input"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Enter project description"
              />
            </div>
            <Button onClick={createProject} data-testid="submit-project-btn">Create Project</Button>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state" data-testid="empty-projects">
          <p>No projects yet. Create your first project to get started!</p>
        </div>
      ) : (
        <div>
          <div className="project-selector">
            <Label>Select Project:</Label>
            <Select value={selectedProject?.id || ""} onValueChange={(value) => setSelectedProject(projects.find(p => p.id === value))}>
              <SelectTrigger data-testid="project-selector">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id} data-testid={`project-option-${project.id}`}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProject && (
            <Tabs defaultValue="stories" className="project-tabs">
              <TabsList data-testid="project-tabs">
                <TabsTrigger value="stories" data-testid="stories-tab">Stories</TabsTrigger>
                <TabsTrigger value="tasks" data-testid="tasks-tab">Tasks</TabsTrigger>
              </TabsList>

              <TabsContent value="stories">
                <div className="tab-header">
                  <h3>Stories</h3>
                  <Dialog open={showStoryDialog} onOpenChange={setShowStoryDialog}>
                    <DialogTrigger asChild>
                      <Button data-testid="create-story-btn">+ New Story</Button>
                    </DialogTrigger>
                    <DialogContent data-testid="story-dialog">
                      <DialogHeader>
                        <DialogTitle>Create New Story</DialogTitle>
                      </DialogHeader>
                      <div className="form-group">
                        <Label>Title</Label>
                        <Input
                          data-testid="story-title-input"
                          value={storyForm.title}
                          onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <Label>Description</Label>
                        <Textarea
                          data-testid="story-description-input"
                          value={storyForm.description}
                          onChange={(e) => setStoryForm({ ...storyForm, description: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <Label>BRD (Business Requirements Document)</Label>
                        <Textarea
                          data-testid="story-brd-input"
                          value={storyForm.brd}
                          onChange={(e) => setStoryForm({ ...storyForm, brd: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <Label>PRD (Product Requirements Document)</Label>
                        <Textarea
                          data-testid="story-prd-input"
                          value={storyForm.prd}
                          onChange={(e) => setStoryForm({ ...storyForm, prd: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <Label>Priority</Label>
                        <Select value={storyForm.priority} onValueChange={(value) => setStoryForm({ ...storyForm, priority: value })}>
                          <SelectTrigger data-testid="story-priority-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={createStory} data-testid="submit-story-btn">Create Story</Button>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="items-grid">
                  {stories.length === 0 ? (
                    <p className="empty-message" data-testid="empty-stories">No stories yet</p>
                  ) : (
                    stories.map(story => (
                      <Card 
                        key={story.id} 
                        className="item-card clickable-card" 
                        data-testid={`story-card-${story.id}`}
                        onClick={() => window.location.href = `/story/${story.id}`}
                      >
                        <CardHeader>
                          <CardTitle>{story.title}</CardTitle>
                          <CardDescription>{story.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="item-meta">
                            <span className={`priority-badge priority-${story.priority.toLowerCase()}`}>
                              {story.priority}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tasks">
                <div className="tab-header">
                  <h3>Tasks</h3>
                  <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                    <DialogTrigger asChild>
                      <Button data-testid="create-task-btn">+ New Task</Button>
                    </DialogTrigger>
                    <DialogContent className="task-dialog" data-testid="task-dialog">
                      <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                      </DialogHeader>
                      <div className="task-form">
                        <div className="form-group">
                          <Label>Title</Label>
                          <Input
                            data-testid="task-title-input"
                            value={taskForm.title}
                            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <Label>Description</Label>
                          <Textarea
                            data-testid="task-description-input"
                            value={taskForm.description}
                            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <Label>Story</Label>
                            <Select value={taskForm.story_id} onValueChange={(value) => setTaskForm({ ...taskForm, story_id: value })}>
                              <SelectTrigger data-testid="task-story-select">
                                <SelectValue placeholder="Select story" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No Story</SelectItem>
                                {stories.map(story => (
                                  <SelectItem key={story.id} value={story.id}>{story.title}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="form-group">
                            <Label>Assigned To</Label>
                            <Select value={taskForm.assigned_to} onValueChange={(value) => setTaskForm({ ...taskForm, assigned_to: value })}>
                              <SelectTrigger data-testid="task-assignee-select">
                                <SelectValue placeholder="Select member" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Unassigned</SelectItem>
                                {teamMembers.map(member => (
                                  <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <Label>Priority</Label>
                            <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}>
                              <SelectTrigger data-testid="task-priority-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="form-group">
                            <Label>Type</Label>
                            <Select value={taskForm.type} onValueChange={(value) => setTaskForm({ ...taskForm, type: value })}>
                              <SelectTrigger data-testid="task-type-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Task">Task</SelectItem>
                                <SelectItem value="Bug">Bug</SelectItem>
                                <SelectItem value="HotFix">HotFix</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <Label>Team</Label>
                            <Select value={taskForm.team} onValueChange={(value) => setTaskForm({ ...taskForm, team: value })}>
                              <SelectTrigger data-testid="task-team-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Frontend">Frontend</SelectItem>
                                <SelectItem value="Backend">Backend</SelectItem>
                                <SelectItem value="QA">QA</SelectItem>
                                <SelectItem value="Product">Product</SelectItem>
                                <SelectItem value="Business">Business</SelectItem>
                                <SelectItem value="Ops">Ops</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="form-group">
                            <Label>Story Points</Label>
                            <Input
                              data-testid="task-story-points-input"
                              type="number"
                              value={taskForm.story_points}
                              onChange={(e) => setTaskForm({ ...taskForm, story_points: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <Label>Start Date</Label>
                            <Input
                              data-testid="task-start-date-input"
                              type="date"
                              value={taskForm.start_date}
                              onChange={(e) => setTaskForm({ ...taskForm, start_date: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <Label>Target Date</Label>
                            <Input
                              data-testid="task-target-date-input"
                              type="date"
                              value={taskForm.target_date}
                              onChange={(e) => setTaskForm({ ...taskForm, target_date: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <Label>End Date</Label>
                          <Input
                            data-testid="task-end-date-input"
                            type="date"
                            value={taskForm.end_date}
                            onChange={(e) => setTaskForm({ ...taskForm, end_date: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button onClick={createTask} data-testid="submit-task-btn">Create Task</Button>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="items-grid">
                  {tasks.length === 0 ? (
                    <p className="empty-message" data-testid="empty-tasks">No tasks yet</p>
                  ) : (
                    tasks.map(task => (
                      <Card key={task.id} className="item-card" data-testid={`task-card-${task.id}`}>
                        <CardHeader>
                          <CardTitle>{task.title}</CardTitle>
                          <CardDescription>{task.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="item-meta">
                            <span className={`status-badge status-${task.status.toLowerCase().replace('_', '-')}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                            <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                              {task.priority}
                            </span>
                            <span className="type-badge">{task.type}</span>
                          </div>
                          {task.assigned_to && (
                            <p className="assigned-to">Assigned to: {task.assigned_to}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
};

const StoryDetail = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [stories, setStories] = useState([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    start_date: "",
    end_date: "",
    target_date: "",
    story_points: "",
    priority: "Medium",
    type: "Task",
    team: "Development"
  });

  useEffect(() => {
    fetchStory();
    fetchTasks();
    fetchTeamMembers();
  }, [storyId]);

  const fetchStory = async () => {
    try {
      const response = await axios.get(`${API}/stories/${storyId}`);
      setStory(response.data);
      setEditForm(response.data);
    } catch (e) {
      console.error("Error fetching story:", e);
      toast.error("Failed to load story");
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks?story_id=${storyId}`);
      setTasks(response.data);
    } catch (e) {
      console.error("Error fetching tasks:", e);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${API}/team`);
      setTeamMembers(response.data);
    } catch (e) {
      console.error("Error fetching team members:", e);
    }
  };

  const updateStory = async () => {
    try {
      await axios.patch(`${API}/stories/${storyId}`, editForm);
      toast.success("Story updated successfully");
      setShowEditDialog(false);
      fetchStory();
    } catch (e) {
      console.error("Error updating story:", e);
      toast.error("Failed to update story");
    }
  };

  const createTask = async () => {
    if (!story) return;
    try {
      await axios.post(`${API}/tasks`, { 
        ...taskForm, 
        project_id: story.project_id,
        story_id: story.id 
      });
      toast.success("Task created successfully");
      setShowTaskDialog(false);
      setTaskForm({
        title: "",
        description: "",
        assigned_to: "",
        start_date: "",
        end_date: "",
        target_date: "",
        story_points: "",
        priority: "Medium",
        type: "Task",
        team: "Development"
      });
      fetchTasks();
    } catch (e) {
      console.error("Error creating task:", e);
      toast.error("Failed to create task");
    }
  };

  if (!story) return <div className="loading" data-testid="loading">Loading...</div>;

  return (
    <div className="page-container" data-testid="story-detail-page">
      <div className="story-detail-header">
        <Button variant="ghost" onClick={() => navigate(-1)} data-testid="back-button">
          <ArrowLeft className="mr-2" size={16} />
          Back
        </Button>
      </div>

      <div className="story-detail-content">
        <Card className="story-main-card">
          <CardHeader>
            <div className="story-header-actions">
              <div>
                <CardTitle className="story-detail-title">{story.title}</CardTitle>
                <span className={`priority-badge priority-${story.priority.toLowerCase()}`}>
                  {story.priority} Priority
                </span>
              </div>
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="edit-story-btn">
                    <Edit2 size={16} className="mr-2" />
                    Edit Story
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="edit-story-dialog">
                  <DialogHeader>
                    <DialogTitle>Edit Story</DialogTitle>
                  </DialogHeader>
                  <div className="form-group">
                    <Label>Title</Label>
                    <Input
                      data-testid="edit-story-title"
                      value={editForm.title || ""}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <Label>Description</Label>
                    <Textarea
                      data-testid="edit-story-description"
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <Label>BRD</Label>
                    <Textarea
                      data-testid="edit-story-brd"
                      value={editForm.brd || ""}
                      onChange={(e) => setEditForm({ ...editForm, brd: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <Label>PRD</Label>
                    <Textarea
                      data-testid="edit-story-prd"
                      value={editForm.prd || ""}
                      onChange={(e) => setEditForm({ ...editForm, prd: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <Label>Priority</Label>
                    <Select value={editForm.priority || "Medium"} onValueChange={(value) => setEditForm({ ...editForm, priority: value })}>
                      <SelectTrigger data-testid="edit-story-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={updateStory} data-testid="update-story-btn">Update Story</Button>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="story-detail-section">
              <h3>Description</h3>
              <p>{story.description}</p>
            </div>
            {story.brd && (
              <div className="story-detail-section">
                <h3>Business Requirements Document (BRD)</h3>
                <p>{story.brd}</p>
              </div>
            )}
            {story.prd && (
              <div className="story-detail-section">
                <h3>Product Requirements Document (PRD)</h3>
                <p>{story.prd}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="story-tasks-section">
          <div className="section-header">
            <h2>Tasks ({tasks.length})</h2>
            <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
              <DialogTrigger asChild>
                <Button data-testid="add-task-story-btn">
                  <Plus size={16} className="mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="task-dialog" data-testid="story-task-dialog">
                <DialogHeader>
                  <DialogTitle>Create Task for Story</DialogTitle>
                </DialogHeader>
                <div className="task-form">
                  <div className="form-group">
                    <Label>Title</Label>
                    <Input
                      data-testid="story-task-title"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <Label>Description</Label>
                    <Textarea
                      data-testid="story-task-description"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <Label>Assigned To</Label>
                      <Select value={taskForm.assigned_to} onValueChange={(value) => setTaskForm({ ...taskForm, assigned_to: value })}>
                        <SelectTrigger data-testid="story-task-assignee">
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {teamMembers.map(member => (
                            <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="form-group">
                      <Label>Priority</Label>
                      <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}>
                        <SelectTrigger data-testid="story-task-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <Label>Type</Label>
                      <Select value={taskForm.type} onValueChange={(value) => setTaskForm({ ...taskForm, type: value })}>
                        <SelectTrigger data-testid="story-task-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Task">Task</SelectItem>
                          <SelectItem value="Bug">Bug</SelectItem>
                          <SelectItem value="HotFix">HotFix</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="form-group">
                      <Label>Team</Label>
                      <Select value={taskForm.team} onValueChange={(value) => setTaskForm({ ...taskForm, team: value })}>
                        <SelectTrigger data-testid="story-task-team">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Frontend">Frontend</SelectItem>
                          <SelectItem value="Backend">Backend</SelectItem>
                          <SelectItem value="QA">QA</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Ops">Ops</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <Label>Story Points</Label>
                      <Input
                        data-testid="story-task-points"
                        type="number"
                        value={taskForm.story_points}
                        onChange={(e) => setTaskForm({ ...taskForm, story_points: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <Label>Target Date</Label>
                      <Input
                        data-testid="story-task-target"
                        type="date"
                        value={taskForm.target_date}
                        onChange={(e) => setTaskForm({ ...taskForm, target_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={createTask} data-testid="create-story-task-btn">Create Task</Button>
              </DialogContent>
            </Dialog>
          </div>

          {tasks.length === 0 ? (
            <p className="empty-message" data-testid="empty-story-tasks">No tasks yet</p>
          ) : (
            <div className="items-grid">
              {tasks.map(task => (
                <Card key={task.id} className="item-card" data-testid={`story-task-card-${task.id}`}>
                  <CardHeader>
                    <CardTitle>{task.title}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="item-meta">
                      <span className={`status-badge status-${task.status.toLowerCase().replace('_', '-')}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                      <span className="type-badge">{task.type}</span>
                    </div>
                    {task.assigned_to && (
                      <p className="assigned-to">Assigned to: {task.assigned_to}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [stories, setStories] = useState([]);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    story_id: "",
    assigned_to: "",
    start_date: "",
    end_date: "",
    target_date: "",
    story_points: "",
    priority: "Medium",
    type: "Task",
    team: "Development"
  });

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks();
      fetchStories();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
      if (response.data.length > 0) {
        setSelectedProject(response.data[0].id);
      }
    } catch (e) {
      console.error("Error fetching projects:", e);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks?project_id=${selectedProject}`);
      setTasks(response.data);
    } catch (e) {
      console.error("Error fetching tasks:", e);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${API}/team`);
      setTeamMembers(response.data);
    } catch (e) {
      console.error("Error fetching team members:", e);
    }
  };

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${API}/stories?project_id=${selectedProject}`);
      setStories(response.data);
    } catch (e) {
      console.error("Error fetching stories:", e);
    }
  };

  const createTask = async () => {
    if (!selectedProject) return;
    try {
      await axios.post(`${API}/tasks`, { ...taskForm, project_id: selectedProject });
      toast.success("Task created successfully");
      setShowTaskDialog(false);
      setTaskForm({
        title: "",
        description: "",
        story_id: "",
        assigned_to: "",
        start_date: "",
        end_date: "",
        target_date: "",
        story_points: "",
        priority: "Medium",
        type: "Task",
        team: "Development"
      });
      fetchTasks();
    } catch (e) {
      console.error("Error creating task:", e);
      toast.error("Failed to create task");
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTask) return;

    try {
      await axios.patch(`${API}/tasks/${draggedTask.id}`, { status: newStatus });
      toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
      fetchTasks();
      setDraggedTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task status");
    }
  };

  const columns = [
    { id: "TODO", title: "TODO", color: "#6B7280" },
    { id: "IN_PROGRESS", title: "In Progress", color: "#3B82F6" },
    { id: "IN_REVIEW", title: "In Review", color: "#F59E0B" },
    { id: "DONE", title: "Done", color: "#10B981" }
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="page-container" data-testid="kanban-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kanban Board</h1>
          <p className="page-subtitle">Drag and drop to update task status</p>
        </div>
        <div className="header-actions">
          {projects.length > 0 && (
            <Select value={selectedProject || ""} onValueChange={setSelectedProject}>
              <SelectTrigger className="project-selector-sm" data-testid="kanban-project-selector">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
            <DialogTrigger asChild>
              <Button data-testid="kanban-add-task-btn">
                <Plus size={16} className="mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="task-dialog" data-testid="kanban-task-dialog">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="task-form">
                <div className="form-group">
                  <Label>Title</Label>
                  <Input
                    data-testid="kanban-task-title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <Label>Description</Label>
                  <Textarea
                    data-testid="kanban-task-description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <Label>Story</Label>
                    <Select value={taskForm.story_id} onValueChange={(value) => setTaskForm({ ...taskForm, story_id: value })}>
                      <SelectTrigger data-testid="kanban-task-story">
                        <SelectValue placeholder="Select story" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Story</SelectItem>
                        {stories.map(story => (
                          <SelectItem key={story.id} value={story.id}>{story.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="form-group">
                    <Label>Assigned To</Label>
                    <Select value={taskForm.assigned_to} onValueChange={(value) => setTaskForm({ ...taskForm, assigned_to: value })}>
                      <SelectTrigger data-testid="kanban-task-assignee">
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {teamMembers.map(member => (
                          <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <Label>Priority</Label>
                    <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}>
                      <SelectTrigger data-testid="kanban-task-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="form-group">
                    <Label>Type</Label>
                    <Select value={taskForm.type} onValueChange={(value) => setTaskForm({ ...taskForm, type: value })}>
                      <SelectTrigger data-testid="kanban-task-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Task">Task</SelectItem>
                        <SelectItem value="Bug">Bug</SelectItem>
                        <SelectItem value="HotFix">HotFix</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <Label>Team</Label>
                    <Select value={taskForm.team} onValueChange={(value) => setTaskForm({ ...taskForm, team: value })}>
                      <SelectTrigger data-testid="kanban-task-team">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Frontend">Frontend</SelectItem>
                        <SelectItem value="Backend">Backend</SelectItem>
                        <SelectItem value="QA">QA</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Ops">Ops</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="form-group">
                    <Label>Story Points</Label>
                    <Input
                      data-testid="kanban-task-points"
                      type="number"
                      value={taskForm.story_points}
                      onChange={(e) => setTaskForm({ ...taskForm, story_points: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={createTask} data-testid="create-kanban-task-btn">Create Task</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!selectedProject ? (
        <div className="empty-state" data-testid="empty-kanban">No projects available</div>
      ) : (
        <div className="kanban-board" data-testid="kanban-board">
          {columns.map(column => (
            <div
              key={column.id}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              data-testid={`kanban-column-${column.id}`}
            >
              <div className="kanban-header" style={{ borderTopColor: column.color }}>
                <h3>{column.title}</h3>
                <span className="task-count">{getTasksByStatus(column.id).length}</span>
              </div>
              <div className="kanban-tasks">
                {getTasksByStatus(column.id).map(task => (
                  <div
                    key={task.id}
                    className="kanban-task"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    data-testid={`kanban-task-${task.id}`}
                  >
                    <h4>{task.title}</h4>
                    <p className="task-description">{task.description}</p>
                    <div className="task-meta">
                      <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                      <span className="type-badge">{task.type}</span>
                    </div>
                    {task.assigned_to && (
                      <div className="task-assignee">
                        <span>👤 {task.assigned_to}</span>
                      </div>
                    )}
                    {task.story_points && (
                      <div className="story-points">{task.story_points} pts</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [stories, setStories] = useState([]);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskForm, setTaskForm] = useState({
    project_id: "",
    title: "",
    description: "",
    story_id: "",
    assigned_to: "",
    start_date: "",
    end_date: "",
    target_date: "",
    story_points: "",
    priority: "Medium",
    type: "Task",
    team: "Development"
  });

  useEffect(() => {
    fetchTodoTasks();
    fetchProjects();
    fetchTeamMembers();
  }, []);

  const fetchTodoTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks?status=TODO`);
      setTasks(response.data);
    } catch (e) {
      console.error("Error fetching todo tasks:", e);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (e) {
      console.error("Error fetching projects:", e);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${API}/team`);
      setTeamMembers(response.data);
    } catch (e) {
      console.error("Error fetching team members:", e);
    }
  };

  const markAsInProgress = async (taskId) => {
    try {
      await axios.patch(`${API}/tasks/${taskId}`, { status: "IN_PROGRESS" });
      toast.success("Task moved to In Progress");
      fetchTodoTasks();
    } catch (e) {
      console.error("Error updating task:", e);
      toast.error("Failed to update task");
    }
  };

  const createTask = async () => {
    if (!taskForm.project_id) {
      toast.error("Please select a project");
      return;
    }
    try {
      await axios.post(`${API}/tasks`, taskForm);
      toast.success("Task created successfully");
      setShowTaskDialog(false);
      setTaskForm({
        project_id: "",
        title: "",
        description: "",
        story_id: "",
        assigned_to: "",
        start_date: "",
        end_date: "",
        target_date: "",
        story_points: "",
        priority: "Medium",
        type: "Task",
        team: "Development"
      });
      fetchTodoTasks();
    } catch (e) {
      console.error("Error creating task:", e);
      toast.error("Failed to create task");
    }
  };

  return (
    <div className="page-container" data-testid="todo-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">TODO List</h1>
          <p className="page-subtitle">All tasks pending to start</p>
        </div>
        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
          <DialogTrigger asChild>
            <Button data-testid="todo-add-task-btn">
              <Plus size={16} className="mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="task-dialog" data-testid="todo-task-dialog">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="task-form">
              <div className="form-group">
                <Label>Project</Label>
                <Select value={taskForm.project_id} onValueChange={(value) => setTaskForm({ ...taskForm, project_id: value })}>
                  <SelectTrigger data-testid="todo-task-project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="form-group">
                <Label>Title</Label>
                <Input
                  data-testid="todo-task-title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <Label>Description</Label>
                <Textarea
                  data-testid="todo-task-description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <Label>Assigned To</Label>
                  <Select value={taskForm.assigned_to} onValueChange={(value) => setTaskForm({ ...taskForm, assigned_to: value })}>
                    <SelectTrigger data-testid="todo-task-assignee">
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group">
                  <Label>Priority</Label>
                  <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}>
                    <SelectTrigger data-testid="todo-task-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <Label>Type</Label>
                  <Select value={taskForm.type} onValueChange={(value) => setTaskForm({ ...taskForm, type: value })}>
                    <SelectTrigger data-testid="todo-task-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Task">Task</SelectItem>
                      <SelectItem value="Bug">Bug</SelectItem>
                      <SelectItem value="HotFix">HotFix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group">
                  <Label>Team</Label>
                  <Select value={taskForm.team} onValueChange={(value) => setTaskForm({ ...taskForm, team: value })}>
                    <SelectTrigger data-testid="todo-task-team">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frontend">Frontend</SelectItem>
                      <SelectItem value="Backend">Backend</SelectItem>
                      <SelectItem value="QA">QA</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Ops">Ops</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <Label>Story Points</Label>
                  <Input
                    data-testid="todo-task-points"
                    type="number"
                    value={taskForm.story_points}
                    onChange={(e) => setTaskForm({ ...taskForm, story_points: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <Label>Target Date</Label>
                  <Input
                    data-testid="todo-task-target"
                    type="date"
                    value={taskForm.target_date}
                    onChange={(e) => setTaskForm({ ...taskForm, target_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <Button onClick={createTask} data-testid="create-todo-task-btn">Create Task</Button>
          </DialogContent>
        </Dialog>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state" data-testid="empty-todo">No TODO tasks</div>
      ) : (
        <div className="todo-list">
          {tasks.map(task => (
            <Card key={task.id} className="todo-card" data-testid={`todo-card-${task.id}`}>
              <CardHeader>
                <div className="todo-card-header">
                  <div>
                    <CardTitle>{task.title}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                  </div>
                  <Button
                    onClick={() => markAsInProgress(task.id)}
                    size="sm"
                    data-testid={`start-task-${task.id}`}
                  >
                    Start Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="task-details">
                  <div className="detail-item">
                    <span className="detail-label">Priority:</span>
                    <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="type-badge">{task.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Team:</span>
                    <span>{task.team}</span>
                  </div>
                  {task.assigned_to && (
                    <div className="detail-item">
                      <span className="detail-label">Assigned to:</span>
                      <span>{task.assigned_to}</span>
                    </div>
                  )}
                  {task.target_date && (
                    <div className="detail-item">
                      <span className="detail-label">Target Date:</span>
                      <span>{task.target_date}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const WeeklySummary = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchWeeklySummary();
  }, []);

  const fetchWeeklySummary = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/weekly`);
      setSummary(response.data);
    } catch (e) {
      console.error("Error fetching weekly summary:", e);
    }
  };

  if (!summary) return <div className="loading" data-testid="loading">Loading...</div>;

  return (
    <div className="page-container" data-testid="weekly-page">
      <div className="page-header">
        <h1 className="page-title">Weekly Summary</h1>
        <p className="page-subtitle">Team-wise task breakdown and progress</p>
      </div>

      {summary.teams.length === 0 ? (
        <div className="empty-state" data-testid="empty-weekly">No data available</div>
      ) : (
        <div className="summary-grid">
          {summary.teams.map(team => (
            <Card key={team.team} className="summary-card" data-testid={`team-summary-${team.team}`}>
              <CardHeader>
                <CardTitle>{team.team}</CardTitle>
                <CardDescription>
                  {team.total} total tasks • {team.done} completed • {team.in_progress} in progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(team.done / team.total) * 100}%` }}
                  />
                </div>
                <div className="task-list">
                  {team.tasks.slice(0, 5).map(task => (
                    <div key={task.id} className="task-item" data-testid={`task-item-${task.id}`}>
                      <div className="task-info">
                        <span className="task-title">{task.title}</span>
                        <span className={`status-badge status-${task.status.toLowerCase().replace('_', '-')}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="task-dates">
                        {task.assigned_to !== 'Unassigned' && (
                          <span className="assignee">👤 {task.assigned_to}</span>
                        )}
                        {task.target_date && (
                          <span className="date">🎯 {task.target_date}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const Team = () => {
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "Developer", department: "Development", avatar: "" });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API}/team`);
      setMembers(response.data);
    } catch (e) {
      console.error("Error fetching team members:", e);
    }
  };

  const addMember = async () => {
    try {
      await axios.post(`${API}/team`, form);
      toast.success("Team member added successfully");
      setShowDialog(false);
      setForm({ name: "", email: "", role: "", avatar: "" });
      fetchMembers();
    } catch (e) {
      console.error("Error adding team member:", e);
      toast.error("Failed to add team member");
    }
  };

  return (
    <div className="page-container" data-testid="team-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle">Manage your team members</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button data-testid="add-member-btn">+ Add Member</Button>
          </DialogTrigger>
          <DialogContent data-testid="member-dialog">
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
            </DialogHeader>
            <div className="form-group">
              <Label>Name</Label>
              <Input
                data-testid="member-name-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <Label>Email</Label>
              <Input
                data-testid="member-email-input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <Label>Role</Label>
              <Input
                data-testid="member-role-input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g., Frontend Developer"
              />
            </div>
            <Button onClick={addMember} data-testid="submit-member-btn">Add Member</Button>
          </DialogContent>
        </Dialog>
      </div>

      {members.length === 0 ? (
        <div className="empty-state" data-testid="empty-team">No team members yet</div>
      ) : (
        <div className="team-grid">
          {members.map(member => (
            <Card key={member.id} className="member-card" data-testid={`member-card-${member.id}`}>
              <CardHeader>
                <div className="member-avatar">{member.name.charAt(0).toUpperCase()}</div>
                <CardTitle>{member.name}</CardTitle>
                <CardDescription>{member.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="member-email">{member.email}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [adminCredentials, setAdminCredentials] = useState(null);
  const [form, setForm] = useState({
    name: "",
    subdomain: "",
    admin_name: "",
    admin_email: "",
    logo: "",
    theme: {
      primaryColor: "#1E40AF",
      secondaryColor: "#3B82F6",
      accentColor: "#60A5FA",
      backgroundColor: "#F8FAFC",
      sidebarColor: "#FFFFFF"
    }
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get(`${API}/organizations`);
      setOrganizations(response.data);
    } catch (e) {
      console.error("Error fetching organizations:", e);
      toast.error("Failed to load organizations");
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const createOrganization = async () => {
    if (!form.name || !form.subdomain || !form.admin_name || !form.admin_email) {
      toast.error("All fields are required");
      return;
    }

    try {
      const response = await axios.post(`${API}/organizations`, form);
      toast.success("Organization created successfully");
      
      // Show admin credentials
      setAdminCredentials(response.data.admin_credentials);
      setShowDialog(false);
      setShowCredentialsDialog(true);
      
      setForm({
        name: "",
        subdomain: "",
        admin_name: "",
        admin_email: "",
        logo: "",
        theme: {
          primaryColor: "#1E40AF",
          secondaryColor: "#3B82F6",
          accentColor: "#60A5FA",
          backgroundColor: "#F8FAFC",
          sidebarColor: "#FFFFFF"
        }
      });
      fetchOrganizations();
    } catch (e) {
      console.error("Error creating organization:", e);
      toast.error(e.response?.data?.detail || "Failed to create organization");
    }
  };

  const updateOrganization = async () => {
    if (!selectedOrg) return;

    try {
      await axios.patch(`${API}/organizations/${selectedOrg.id}`, {
        name: form.name,
        logo: form.logo,
        theme: form.theme
      });
      toast.success("Organization updated successfully");
      setShowSettingsDialog(false);
      setSelectedOrg(null);
      fetchOrganizations();
    } catch (e) {
      console.error("Error updating organization:", e);
      toast.error("Failed to update organization");
    }
  };

  const openSettings = (org) => {
    setSelectedOrg(org);
    setForm({
      name: org.name,
      subdomain: org.subdomain,
      logo: org.logo || "",
      theme: org.theme || {
        primaryColor: "#1E40AF",
        secondaryColor: "#3B82F6",
        accentColor: "#60A5FA",
        backgroundColor: "#F8FAFC",
        sidebarColor: "#FFFFFF"
      }
    });
    setShowSettingsDialog(true);
  };

  return (
    <div className="page-container" data-testid="organizations-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Organizations</h1>
          <p className="page-subtitle">Manage all organizations in the system</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button data-testid="create-organization-btn">
              <Plus size={16} className="mr-2" />
              Create Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="org-dialog" data-testid="organization-dialog">
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>Set up a new organization with custom branding</DialogDescription>
            </DialogHeader>
            <div className="org-form">
              <div className="form-group">
                <Label>Organization Name</Label>
                <Input
                  data-testid="org-name-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Acme Corp"
                  required
                />
              </div>
              <div className="form-group">
                <Label>Subdomain</Label>
                <Input
                  data-testid="org-subdomain-input"
                  value={form.subdomain}
                  onChange={(e) => setForm({ ...form, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="e.g., acme"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">URL: {form.subdomain || 'subdomain'}.taskflow.com</p>
              </div>
              
              <div className="form-section-header">
                <h3>Organization Admin</h3>
                <p className="text-sm text-gray-500">Admin credentials will be auto-generated</p>
              </div>
              
              <div className="form-group">
                <Label>Admin Name</Label>
                <Input
                  data-testid="org-admin-name-input"
                  value={form.admin_name}
                  onChange={(e) => setForm({ ...form, admin_name: e.target.value })}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <Label>Admin Email</Label>
                <Input
                  type="email"
                  data-testid="org-admin-email-input"
                  value={form.admin_email}
                  onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
                  placeholder="e.g., admin@acme.com"
                  required
                />
              </div>
              <div className="form-group">
                <Label>Logo (Optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  data-testid="org-logo-input"
                />
                {form.logo && (
                  <div className="logo-preview">
                    <img src={form.logo} alt="Logo preview" />
                  </div>
                )}
              </div>
              <div className="form-group">
                <Label>Theme Colors</Label>
                <div className="theme-colors-grid">
                  <div className="color-input-group">
                    <Label className="text-xs">Primary</Label>
                    <Input
                      type="color"
                      value={form.theme.primaryColor}
                      onChange={(e) => setForm({ ...form, theme: { ...form.theme, primaryColor: e.target.value } })}
                      data-testid="org-primary-color"
                    />
                  </div>
                  <div className="color-input-group">
                    <Label className="text-xs">Secondary</Label>
                    <Input
                      type="color"
                      value={form.theme.secondaryColor}
                      onChange={(e) => setForm({ ...form, theme: { ...form.theme, secondaryColor: e.target.value } })}
                      data-testid="org-secondary-color"
                    />
                  </div>
                  <div className="color-input-group">
                    <Label className="text-xs">Accent</Label>
                    <Input
                      type="color"
                      value={form.theme.accentColor}
                      onChange={(e) => setForm({ ...form, theme: { ...form.theme, accentColor: e.target.value } })}
                      data-testid="org-accent-color"
                    />
                  </div>
                  <div className="color-input-group">
                    <Label className="text-xs">Background</Label>
                    <Input
                      type="color"
                      value={form.theme.backgroundColor}
                      onChange={(e) => setForm({ ...form, theme: { ...form.theme, backgroundColor: e.target.value } })}
                      data-testid="org-bg-color"
                    />
                  </div>
                  <div className="color-input-group">
                    <Label className="text-xs">Sidebar</Label>
                    <Input
                      type="color"
                      value={form.theme.sidebarColor}
                      onChange={(e) => setForm({ ...form, theme: { ...form.theme, sidebarColor: e.target.value } })}
                      data-testid="org-sidebar-color"
                    />
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={createOrganization} data-testid="submit-organization-btn">
              Create Organization
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent data-testid="credentials-dialog">
          <DialogHeader>
            <DialogTitle>Organization Created Successfully! 🎉</DialogTitle>
            <DialogDescription>Save these admin credentials - they won't be shown again</DialogDescription>
          </DialogHeader>
          {adminCredentials && (
            <div className="credentials-box">
              <div className="credentials-item">
                <Label>Admin Name</Label>
                <Input value={adminCredentials.name} readOnly />
              </div>
              <div className="credentials-item">
                <Label>Email</Label>
                <Input value={adminCredentials.email} readOnly />
              </div>
              <div className="credentials-item">
                <Label>Password</Label>
                <Input value={adminCredentials.password} readOnly className="font-mono font-bold text-lg" />
              </div>
              <div className="credentials-warning">
                ⚠️ Please save these credentials. The admin can now login and manage their organization.
              </div>
            </div>
          )}
          <Button onClick={() => {
            navigator.clipboard.writeText(`Email: ${adminCredentials?.email}\nPassword: ${adminCredentials?.password}`);
            toast.success("Credentials copied to clipboard!");
          }}>
            Copy Credentials
          </Button>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="org-dialog" data-testid="organization-settings-dialog">
          <DialogHeader>
            <DialogTitle>Organization Settings</DialogTitle>
            <DialogDescription>Update organization branding and theme</DialogDescription>
          </DialogHeader>
          <div className="org-form">
            <div className="form-group">
              <Label>Organization Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                data-testid="edit-org-name"
              />
            </div>
            <div className="form-group">
              <Label>Subdomain (Read-only)</Label>
              <Input value={form.subdomain} disabled />
            </div>
            <div className="form-group">
              <Label>Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                data-testid="edit-org-logo"
              />
              {form.logo && (
                <div className="logo-preview">
                  <img src={form.logo} alt="Logo preview" />
                </div>
              )}
            </div>
            <div className="form-group">
              <Label>Theme Colors</Label>
              <div className="theme-colors-grid">
                <div className="color-input-group">
                  <Label className="text-xs">Primary</Label>
                  <Input
                    type="color"
                    value={form.theme.primaryColor}
                    onChange={(e) => setForm({ ...form, theme: { ...form.theme, primaryColor: e.target.value } })}
                  />
                </div>
                <div className="color-input-group">
                  <Label className="text-xs">Secondary</Label>
                  <Input
                    type="color"
                    value={form.theme.secondaryColor}
                    onChange={(e) => setForm({ ...form, theme: { ...form.theme, secondaryColor: e.target.value } })}
                  />
                </div>
                <div className="color-input-group">
                  <Label className="text-xs">Accent</Label>
                  <Input
                    type="color"
                    value={form.theme.accentColor}
                    onChange={(e) => setForm({ ...form, theme: { ...form.theme, accentColor: e.target.value } })}
                  />
                </div>
                <div className="color-input-group">
                  <Label className="text-xs">Background</Label>
                  <Input
                    type="color"
                    value={form.theme.backgroundColor}
                    onChange={(e) => setForm({ ...form, theme: { ...form.theme, backgroundColor: e.target.value } })}
                  />
                </div>
                <div className="color-input-group">
                  <Label className="text-xs">Sidebar</Label>
                  <Input
                    type="color"
                    value={form.theme.sidebarColor}
                    onChange={(e) => setForm({ ...form, theme: { ...form.theme, sidebarColor: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          </div>
          <Button onClick={updateOrganization} data-testid="update-organization-btn">
            Update Organization
          </Button>
        </DialogContent>
      </Dialog>

      {organizations.length === 0 ? (
        <div className="empty-state" data-testid="empty-organizations">
          <p>No organizations yet. Create your first organization!</p>
        </div>
      ) : (
        <div className="organizations-grid">
          {organizations.map(org => (
            <Card key={org.id} className="organization-card" data-testid={`org-card-${org.id}`}>
              <CardHeader>
                <div className="org-card-header">
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} className="org-logo" />
                  ) : (
                    <div className="org-logo-placeholder" style={{ backgroundColor: org.theme?.primaryColor }}>
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="org-info">
                    <CardTitle>{org.name}</CardTitle>
                    <CardDescription>{org.subdomain}.taskflow.com</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="org-theme-preview">
                  <div className="theme-colors">
                    <div 
                      className="theme-color-swatch" 
                      style={{ backgroundColor: org.theme?.primaryColor }}
                      title="Primary"
                    />
                    <div 
                      className="theme-color-swatch" 
                      style={{ backgroundColor: org.theme?.secondaryColor }}
                      title="Secondary"
                    />
                    <div 
                      className="theme-color-swatch" 
                      style={{ backgroundColor: org.theme?.accentColor }}
                      title="Accent"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => openSettings(org)}
                  data-testid={`edit-org-${org.id}`}
                >
                  <Edit2 size={14} className="mr-2" />
                  Edit Settings
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#3B82F6" });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API}/departments`);
      setDepartments(response.data);
    } catch (e) {
      console.error("Error fetching departments:", e);
    }
  };

  const addDepartment = async () => {
    try {
      await axios.post(`${API}/departments`, form);
      toast.success("Department added successfully");
      setShowDialog(false);
      setForm({ name: "", description: "", color: "#3B82F6" });
      fetchDepartments();
    } catch (e) {
      console.error("Error adding department:", e);
      toast.error("Failed to add department");
    }
  };

  const departmentColors = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Green", value: "#10B981" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Orange", value: "#F59E0B" },
    { name: "Red", value: "#EF4444" },
    { name: "Teal", value: "#14B8A6" }
  ];

  return (
    <div className="page-container" data-testid="departments-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">Manage your organization departments</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button data-testid="add-department-btn">
              <Plus size={16} className="mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="department-dialog">
            <DialogHeader>
              <DialogTitle>Add Department</DialogTitle>
            </DialogHeader>
            <div className="form-group">
              <Label>Department Name</Label>
              <Input
                data-testid="department-name-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Frontend, Backend, QA"
              />
            </div>
            <div className="form-group">
              <Label>Description</Label>
              <Textarea
                data-testid="department-description-input"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Department description"
              />
            </div>
            <div className="form-group">
              <Label>Color</Label>
              <div className="color-picker-grid">
                {departmentColors.map(color => (
                  <div
                    key={color.value}
                    className={`color-option ${form.color === color.value ? 'selected' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setForm({ ...form, color: color.value })}
                    data-testid={`color-${color.name.toLowerCase()}`}
                  >
                    {form.color === color.value && <span className="check-mark">✓</span>}
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={addDepartment} data-testid="submit-department-btn">Add Department</Button>
          </DialogContent>
        </Dialog>
      </div>

      {departments.length === 0 ? (
        <div className="empty-state" data-testid="empty-departments">
          <p>No departments yet. Add your first department to organize teams!</p>
        </div>
      ) : (
        <div className="departments-grid">
          {departments.map(dept => (
            <Card key={dept.id} className="department-card" data-testid={`department-card-${dept.id}`}>
              <CardHeader>
                <div className="department-header">
                  <div 
                    className="department-icon" 
                    style={{ backgroundColor: dept.color }}
                  >
                    {dept.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle>{dept.name}</CardTitle>
                    <CardDescription>{dept.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const Performance = () => {
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/performance`);
      setPerformance(response.data);
    } catch (e) {
      console.error("Error fetching performance:", e);
    }
  };

  if (!performance) return <div className="loading" data-testid="loading">Loading...</div>;

  return (
    <div className="page-container" data-testid="performance-page">
      <div className="page-header">
        <h1 className="page-title">Team Performance</h1>
        <p className="page-subtitle">Individual member metrics and statistics</p>
      </div>

      {performance.performance.length === 0 ? (
        <div className="empty-state" data-testid="empty-performance">No performance data available</div>
      ) : (
        <div className="performance-grid">
          {performance.performance.map(member => (
            <Card key={member.name} className="performance-card" data-testid={`performance-card-${member.name}`}>
              <CardHeader>
                <div className="performance-header">
                  <div>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </div>
                  <div className="completion-rate">
                    <span className="rate-value">{member.completion_rate}%</span>
                    <span className="rate-label">Completion</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="performance-stats">
                  <div className="stat">
                    <span className="stat-label">Total Tasks</span>
                    <span className="stat-value">{member.total_tasks}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Completed</span>
                    <span className="stat-value completed">{member.completed_tasks}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">In Progress</span>
                    <span className="stat-value in-progress">{member.in_progress_tasks}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Story Points</span>
                    <span className="stat-value">{member.total_story_points}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

function App() {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return (
      <div className="App">
        <Toaster position="top-right" />
        <Login />
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-right" />
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/story/:storyId" element={<StoryDetail />} />
              <Route path="/kanban" element={<KanbanBoard />} />
              <Route path="/todo" element={<TodoList />} />
              <Route path="/weekly" element={<WeeklySummary />} />
              <Route path="/team" element={<Team />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/organizations" element={<Organizations />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;