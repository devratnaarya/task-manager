from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectCreate(BaseModel):
    name: str
    description: str

class Story(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    title: str
    description: str
    brd: str = ""
    prd: str = ""
    priority: str = "Medium"  # Low, Medium, High, Critical
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StoryCreate(BaseModel):
    project_id: str
    title: str
    description: str
    brd: str = ""
    prd: str = ""
    priority: str = "Medium"

class StoryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    brd: Optional[str] = None
    prd: Optional[str] = None
    priority: Optional[str] = None

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user: str
    text: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    story_id: Optional[str] = None
    title: str
    description: str
    attachments: List[str] = []
    comments: List[dict] = []
    assigned_to: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    target_date: Optional[str] = None
    story_points: Optional[int] = None
    priority: str = "Medium"  # Low, Medium, High, Critical
    type: str = "Task"  # Bug, Task, HotFix
    status: str = "TODO"  # TODO, IN_PROGRESS, IN_REVIEW, DONE
    team: str = "Development"  # Development, QA, Backend, Frontend
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaskCreate(BaseModel):
    project_id: str
    story_id: Optional[str] = None
    title: str
    description: str
    assigned_to: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    target_date: Optional[str] = None
    story_points: Optional[int] = None
    priority: str = "Medium"
    type: str = "Task"
    team: str = "Development"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    target_date: Optional[str] = None
    story_points: Optional[int] = None
    priority: Optional[str] = None
    type: Optional[str] = None
    team: Optional[str] = None

class CommentCreate(BaseModel):
    task_id: str
    user: str
    text: str

class TeamMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    role: str
    avatar: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TeamMemberCreate(BaseModel):
    name: str
    email: str
    role: str
    avatar: str = ""

class Department(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    color: str = "#3B82F6"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DepartmentCreate(BaseModel):
    name: str
    description: str
    color: str = "#3B82F6"

# Project Endpoints
@api_router.post("/projects", response_model=Project)
async def create_project(input: ProjectCreate):
    project_dict = input.model_dump()
    project_obj = Project(**project_dict)
    doc = project_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.projects.insert_one(doc)
    return project_obj

@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
    for project in projects:
        if isinstance(project['created_at'], str):
            project['created_at'] = datetime.fromisoformat(project['created_at'])
    return projects

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if isinstance(project['created_at'], str):
        project['created_at'] = datetime.fromisoformat(project['created_at'])
    return project

# Story Endpoints
@api_router.post("/stories", response_model=Story)
async def create_story(input: StoryCreate):
    story_dict = input.model_dump()
    story_obj = Story(**story_dict)
    doc = story_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.stories.insert_one(doc)
    return story_obj

@api_router.get("/stories", response_model=List[Story])
async def get_stories(project_id: Optional[str] = None):
    query = {"project_id": project_id} if project_id else {}
    stories = await db.stories.find(query, {"_id": 0}).to_list(1000)
    for story in stories:
        if isinstance(story['created_at'], str):
            story['created_at'] = datetime.fromisoformat(story['created_at'])
    return stories

@api_router.get("/stories/{story_id}", response_model=Story)
async def get_story(story_id: str):
    story = await db.stories.find_one({"id": story_id}, {"_id": 0})
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    if isinstance(story['created_at'], str):
        story['created_at'] = datetime.fromisoformat(story['created_at'])
    return story

@api_router.patch("/stories/{story_id}", response_model=Story)
async def update_story(story_id: str, input: StoryUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.stories.update_one(
        {"id": story_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Story not found")
    
    story = await db.stories.find_one({"id": story_id}, {"_id": 0})
    if isinstance(story['created_at'], str):
        story['created_at'] = datetime.fromisoformat(story['created_at'])
    return story

# Task Endpoints
@api_router.post("/tasks", response_model=Task)
async def create_task(input: TaskCreate):
    task_dict = input.model_dump()
    task_obj = Task(**task_dict)
    doc = task_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.tasks.insert_one(doc)
    return task_obj

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(project_id: Optional[str] = None, story_id: Optional[str] = None, status: Optional[str] = None, assigned_to: Optional[str] = None):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if story_id:
        query["story_id"] = story_id
    if status:
        query["status"] = status
    if assigned_to:
        query["assigned_to"] = assigned_to
    tasks = await db.tasks.find(query, {"_id": 0}).to_list(1000)
    for task in tasks:
        if isinstance(task['created_at'], str):
            task['created_at'] = datetime.fromisoformat(task['created_at'])
        if isinstance(task['updated_at'], str):
            task['updated_at'] = datetime.fromisoformat(task['updated_at'])
    return tasks

@api_router.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: str):
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if isinstance(task['created_at'], str):
        task['created_at'] = datetime.fromisoformat(task['created_at'])
    if isinstance(task['updated_at'], str):
        task['updated_at'] = datetime.fromisoformat(task['updated_at'])
    return task

@api_router.patch("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, input: TaskUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.tasks.update_one(
        {"id": task_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if isinstance(task['created_at'], str):
        task['created_at'] = datetime.fromisoformat(task['created_at'])
    if isinstance(task['updated_at'], str):
        task['updated_at'] = datetime.fromisoformat(task['updated_at'])
    return task

@api_router.post("/tasks/{task_id}/comments")
async def add_comment(task_id: str, input: CommentCreate):
    comment = Comment(user=input.user, text=input.text)
    result = await db.tasks.update_one(
        {"id": task_id},
        {"$push": {"comments": comment.model_dump()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Comment added successfully", "comment": comment}

# Team Endpoints
@api_router.post("/team", response_model=TeamMember)
async def create_team_member(input: TeamMemberCreate):
    member_dict = input.model_dump()
    member_obj = TeamMember(**member_dict)
    doc = member_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.team_members.insert_one(doc)
    return member_obj

@api_router.get("/team", response_model=List[TeamMember])
async def get_team_members():
    members = await db.team_members.find({}, {"_id": 0}).to_list(1000)
    for member in members:
        if isinstance(member['created_at'], str):
            member['created_at'] = datetime.fromisoformat(member['created_at'])
    return members

# Department Endpoints
@api_router.post("/departments", response_model=Department)
async def create_department(input: DepartmentCreate):
    dept_dict = input.model_dump()
    dept_obj = Department(**dept_dict)
    doc = dept_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.departments.insert_one(doc)
    return dept_obj

@api_router.get("/departments", response_model=List[Department])
async def get_departments():
    depts = await db.departments.find({}, {"_id": 0}).to_list(1000)
    for dept in depts:
        if isinstance(dept['created_at'], str):
            dept['created_at'] = datetime.fromisoformat(dept['created_at'])
    return depts

# Dashboard Endpoints
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    total_projects = await db.projects.count_documents({})
    total_tasks = await db.tasks.count_documents({})
    total_stories = await db.stories.count_documents({})
    total_members = await db.team_members.count_documents({})
    
    todo_tasks = await db.tasks.count_documents({"status": "TODO"})
    in_progress_tasks = await db.tasks.count_documents({"status": "IN_PROGRESS"})
    in_review_tasks = await db.tasks.count_documents({"status": "IN_REVIEW"})
    done_tasks = await db.tasks.count_documents({"status": "DONE"})
    
    high_priority = await db.tasks.count_documents({"priority": "High"})
    critical_priority = await db.tasks.count_documents({"priority": "Critical"})
    
    return {
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "total_stories": total_stories,
        "total_members": total_members,
        "task_breakdown": {
            "todo": todo_tasks,
            "in_progress": in_progress_tasks,
            "in_review": in_review_tasks,
            "done": done_tasks
        },
        "priority_breakdown": {
            "high": high_priority,
            "critical": critical_priority
        }
    }

@api_router.get("/dashboard/weekly")
async def get_weekly_summary():
    # Get all tasks
    all_tasks = await db.tasks.find({}, {"_id": 0}).to_list(1000)
    
    # Group by team
    team_summary = {}
    for task in all_tasks:
        team = task.get('team', 'Development')
        if team not in team_summary:
            team_summary[team] = {
                "team": team,
                "total": 0,
                "done": 0,
                "in_progress": 0,
                "tasks": []
            }
        team_summary[team]['total'] += 1
        if task['status'] == 'DONE':
            team_summary[team]['done'] += 1
        elif task['status'] == 'IN_PROGRESS':
            team_summary[team]['in_progress'] += 1
        
        team_summary[team]['tasks'].append({
            "id": task['id'],
            "title": task['title'],
            "status": task['status'],
            "assigned_to": task.get('assigned_to', 'Unassigned'),
            "start_date": task.get('start_date'),
            "end_date": task.get('end_date'),
            "target_date": task.get('target_date'),
            "priority": task.get('priority', 'Medium')
        })
    
    return {"teams": list(team_summary.values())}

@api_router.get("/dashboard/performance")
async def get_team_performance():
    members = await db.team_members.find({}, {"_id": 0}).to_list(1000)
    performance = []
    
    for member in members:
        member_tasks = await db.tasks.find({"assigned_to": member['name']}, {"_id": 0}).to_list(1000)
        total = len(member_tasks)
        completed = sum(1 for t in member_tasks if t['status'] == 'DONE')
        in_progress = sum(1 for t in member_tasks if t['status'] == 'IN_PROGRESS')
        story_points = sum(t.get('story_points', 0) for t in member_tasks if t.get('story_points'))
        
        performance.append({
            "name": member['name'],
            "email": member['email'],
            "role": member['role'],
            "total_tasks": total,
            "completed_tasks": completed,
            "in_progress_tasks": in_progress,
            "completion_rate": round((completed / total * 100) if total > 0 else 0, 1),
            "total_story_points": story_points
        })
    
    return {"performance": performance}

@api_router.get("/")
async def root():
    return {"message": "Task Management API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()