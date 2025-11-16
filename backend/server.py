from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Header, Depends
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
import base64
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class Organization(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    subdomain: str
    logo: str = ""  # Base64 encoded logo
    theme: dict = {
        "primaryColor": "#1E40AF",
        "secondaryColor": "#3B82F6",
        "accentColor": "#60A5FA",
        "backgroundColor": "#F8FAFC",
        "sidebarColor": "#FFFFFF"
    }
    settings: dict = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class OrganizationCreate(BaseModel):
    name: str
    subdomain: str
    admin_name: str
    admin_email: str
    logo: str = ""
    theme: Optional[dict] = None

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    logo: Optional[str] = None
    theme: Optional[dict] = None
    settings: Optional[dict] = None
    is_active: Optional[bool] = None

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    password: str  # Hashed password
    role: str = "Developer"  # SuperAdmin, Admin, Product, Developer, Ops
    organization_id: Optional[str] = None
    avatar: str = ""
    temp_password: Optional[str] = None  # Store temporary password for retrieval
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "Developer"
    organization_id: Optional[str] = None
    avatar: str = ""

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    avatar: Optional[str] = None
    is_active: Optional[bool] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    user: dict
    organization: Optional[dict] = None
    token: str

class ActionHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    organization_id: str
    user: str
    action: str
    entity_type: str
    entity_id: str
    entity_name: str
    details: dict = {}
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    organization_id: str
    name: str
    description: str
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectCreate(BaseModel):
    name: str
    description: str

class Story(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    organization_id: str
    project_id: str
    title: str
    description: str
    brd: str = ""
    prd: str = ""
    priority: str = "Medium"
    created_by: Optional[str] = None
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

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    organization_id: str
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
    priority: str = "Medium"
    type: str = "Task"
    status: str = "TODO"
    team: str = "Development"
    linked_tasks: List[str] = []
    created_by: Optional[str] = None
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
    linked_tasks: List[str] = []

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
    linked_tasks: Optional[List[str]] = None

class CommentCreate(BaseModel):
    task_id: str
    user: str
    text: str

class TeamMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    organization_id: str
    name: str
    email: str
    role: str
    department: str = "Development"
    avatar: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TeamMemberCreate(BaseModel):
    name: str
    email: str
    role: str
    department: str = "Development"
    avatar: str = ""

class TeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    avatar: Optional[str] = None

class Department(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    organization_id: str
    name: str
    description: str
    color: str = "#3B82F6"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DepartmentCreate(BaseModel):
    name: str
    description: str
    color: str = "#3B82F6"

# Helper functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

async def get_organization_id(x_organization_id: Optional[str] = Header(None)) -> str:
    if not x_organization_id or x_organization_id == "null":
        # Allow null for SuperAdmin operations
        return "null"
    return x_organization_id

async def log_action(org_id: str, user: str, action: str, entity_type: str, entity_id: str, entity_name: str, details: dict = {}):
    if org_id == "null":
        return
    action_log = ActionHistory(
        organization_id=org_id,
        user=user,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_name=entity_name,
        details=details
    )
    doc = action_log.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.action_history.insert_one(doc)

# Create super admin on startup
@app.on_event("startup")
async def create_super_admin():
    existing = await db.users.find_one({"email": "admin@gmail.com"})
    if not existing:
        super_admin = User(
            name="Super Admin",
            email="admin@gmail.com",
            password=hash_password("12345"),
            role="SuperAdmin",
            organization_id=None
        )
        doc = super_admin.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
        logger.info("Super admin created: admin@gmail.com / 12345")

# Authentication Endpoints
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(input: LoginRequest):
    user = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user or not verify_password(input.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.get('is_active', True):
        raise HTTPException(status_code=403, detail="User account is inactive")
    
    # Get organization if user has one
    organization = None
    if user.get('organization_id'):
        organization = await db.organizations.find_one({"id": user['organization_id']}, {"_id": 0})
        if organization and isinstance(organization.get('created_at'), str):
            organization['created_at'] = datetime.fromisoformat(organization['created_at'])
    
    # Remove password from response
    user_data = {k: v for k, v in user.items() if k != 'password'}
    if isinstance(user_data.get('created_at'), str):
        user_data['created_at'] = datetime.fromisoformat(user_data['created_at'])
    
    # Generate simple token (in production, use JWT)
    token = f"{user['id']}:{user['email']}:{user['role']}"
    
    return LoginResponse(
        user=user_data,
        organization=organization,
        token=token
    )

@api_router.post("/auth/register", response_model=User)
async def register(input: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = input.model_dump()
    user_dict['password'] = hash_password(user_dict['password'])
    user_obj = User(**user_dict)
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    # Remove password from response
    user_data = user_obj.model_dump()
    del user_data['password']
    return user_data

# Organization Endpoints (Super Admin only)
@api_router.post("/organizations")
async def create_organization(input: OrganizationCreate, x_user_role: Optional[str] = Header(None)):
    if x_user_role != "SuperAdmin":
        raise HTTPException(status_code=403, detail="Only super admin can create organizations")
    
    # Check if subdomain exists
    existing = await db.organizations.find_one({"subdomain": input.subdomain})
    if existing:
        raise HTTPException(status_code=400, detail="Subdomain already exists")
    
    # Check if admin email exists
    existing_user = await db.users.find_one({"email": input.admin_email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Admin email already exists")
    
    # Create organization
    org_dict = {
        "name": input.name,
        "subdomain": input.subdomain,
        "logo": input.logo or "",
        "theme": input.theme or {
            "primaryColor": "#1E40AF",
            "secondaryColor": "#3B82F6",
            "accentColor": "#60A5FA",
            "backgroundColor": "#F8FAFC",
            "sidebarColor": "#FFFFFF"
        }
    }
    org_obj = Organization(**org_dict)
    doc = org_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.organizations.insert_one(doc)
    
    # Generate random password for admin
    import random
    import string
    admin_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    
    # Create admin user for this organization
    admin_user = User(
        name=input.admin_name,
        email=input.admin_email,
        password=hash_password(admin_password),
        role="Admin",
        organization_id=org_obj.id
    )
    admin_doc = admin_user.model_dump()
    admin_doc['created_at'] = admin_doc['created_at'].isoformat()
    await db.users.insert_one(admin_doc)
    
    # Return organization with admin credentials
    org_response = org_obj.model_dump()
    org_response['admin_credentials'] = {
        'email': input.admin_email,
        'password': admin_password,
        'name': input.admin_name
    }
    
    return org_response

@api_router.get("/organizations", response_model=List[Organization])
async def get_organizations(x_user_role: Optional[str] = Header(None)):
    if x_user_role != "SuperAdmin":
        raise HTTPException(status_code=403, detail="Only super admin can view all organizations")
    orgs = await db.organizations.find({}, {"_id": 0}).to_list(1000)
    for org in orgs:
        if isinstance(org['created_at'], str):
            org['created_at'] = datetime.fromisoformat(org['created_at'])
    return orgs

@api_router.get("/organizations/{org_id}", response_model=Organization)
async def get_organization(org_id: str):
    org = await db.organizations.find_one({"id": org_id}, {"_id": 0})
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    if isinstance(org['created_at'], str):
        org['created_at'] = datetime.fromisoformat(org['created_at'])
    return org

@api_router.patch("/organizations/{org_id}", response_model=Organization)
async def update_organization(org_id: str, input: OrganizationUpdate, x_user_role: Optional[str] = Header(None)):
    if x_user_role not in ["SuperAdmin", "Admin"]:
        raise HTTPException(status_code=403, detail="Only super admin or admin can update organization")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.organizations.update_one({"id": org_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    org = await db.organizations.find_one({"id": org_id}, {"_id": 0})
    if isinstance(org['created_at'], str):
        org['created_at'] = datetime.fromisoformat(org['created_at'])
    return org

# User Endpoints
@api_router.post("/users")
async def create_user(input: UserCreate, org_id: str = Depends(get_organization_id), x_user_name: Optional[str] = Header(None)):
    # Check if email exists
    existing = await db.users.find_one({"email": input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = input.model_dump()
    user_dict['organization_id'] = org_id if org_id != "null" else None
    user_dict['password'] = hash_password(user_dict['password'])
    user_obj = User(**user_dict)
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    await log_action(org_id, x_user_name or "System", "created", "user", user_obj.id, user_obj.name)
    
    # Remove password from response
    user_data = user_obj.model_dump()
    del user_data['password']
    return user_data

@api_router.get("/users")
async def get_users(org_id: str = Depends(get_organization_id)):
    query = {"organization_id": org_id} if org_id != "null" else {}
    users = await db.users.find(query, {"_id": 0, "password": 0}).to_list(1000)
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

@api_router.get("/users/{user_id}")
async def get_user(user_id: str, org_id: str = Depends(get_organization_id)):
    query = {"id": user_id}
    if org_id != "null":
        query["organization_id"] = org_id
    user = await db.users.find_one(query, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    return user

@api_router.patch("/users/{user_id}")
async def update_user(user_id: str, input: UserUpdate, org_id: str = Depends(get_organization_id), x_user_name: Optional[str] = Header(None)):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    query = {"id": user_id}
    if org_id != "null":
        query["organization_id"] = org_id
    
    result = await db.users.update_one(query, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    await log_action(org_id, x_user_name or "System", "updated", "user", user_id, user['name'], update_data)
    return user

# Project Endpoints
@api_router.post("/projects", response_model=Project)
async def create_project(input: ProjectCreate, org_id: str = Depends(get_organization_id), x_user_name: Optional[str] = Header(None)):
    project_dict = input.model_dump()
    project_dict['organization_id'] = org_id
    project_dict['created_by'] = x_user_name
    project_obj = Project(**project_dict)
    doc = project_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.projects.insert_one(doc)
    await log_action(org_id, x_user_name or "System", "created", "project", project_obj.id, project_obj.name)
    return project_obj

@api_router.get("/projects", response_model=List[Project])
async def get_projects(org_id: str = Depends(get_organization_id)):
    projects = await db.projects.find({"organization_id": org_id}, {"_id": 0}).to_list(1000)
    for project in projects:
        if isinstance(project['created_at'], str):
            project['created_at'] = datetime.fromisoformat(project['created_at'])
    return projects

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, org_id: str = Depends(get_organization_id)):
    project = await db.projects.find_one({"id": project_id, "organization_id": org_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if isinstance(project['created_at'], str):
        project['created_at'] = datetime.fromisoformat(project['created_at'])
    return project

# Story Endpoints
@api_router.post("/stories", response_model=Story)
async def create_story(input: StoryCreate, org_id: str = Depends(get_organization_id), x_user_name: Optional[str] = Header(None)):
    story_dict = input.model_dump()
    story_dict['organization_id'] = org_id
    story_dict['created_by'] = x_user_name
    story_obj = Story(**story_dict)
    doc = story_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.stories.insert_one(doc)
    await log_action(org_id, x_user_name or "System", "created", "story", story_obj.id, story_obj.title)
    return story_obj

@api_router.get("/stories", response_model=List[Story])
async def get_stories(org_id: str = Depends(get_organization_id), project_id: Optional[str] = None):
    query = {"organization_id": org_id}
    if project_id:
        query["project_id"] = project_id
    stories = await db.stories.find(query, {"_id": 0}).to_list(1000)
    for story in stories:
        if isinstance(story['created_at'], str):
            story['created_at'] = datetime.fromisoformat(story['created_at'])
    return stories

@api_router.get("/stories/{story_id}", response_model=Story)
async def get_story(story_id: str, org_id: str = Depends(get_organization_id)):
    story = await db.stories.find_one({"id": story_id, "organization_id": org_id}, {"_id": 0})
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    if isinstance(story['created_at'], str):
        story['created_at'] = datetime.fromisoformat(story['created_at'])
    return story

@api_router.patch("/stories/{story_id}", response_model=Story)
async def update_story(story_id: str, input: StoryUpdate, org_id: str = Depends(get_organization_id), x_user_name: Optional[str] = Header(None)):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.stories.update_one({"id": story_id, "organization_id": org_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Story not found")
    
    story = await db.stories.find_one({"id": story_id}, {"_id": 0})
    if isinstance(story['created_at'], str):
        story['created_at'] = datetime.fromisoformat(story['created_at'])
    await log_action(org_id, x_user_name or "System", "updated", "story", story_id, story['title'], update_data)
    return story

# Task Endpoints
@api_router.post("/tasks", response_model=Task)
async def create_task(input: TaskCreate, org_id: str = Depends(get_organization_id), x_user_name: Optional[str] = Header(None)):
    task_dict = input.model_dump()
    task_dict['organization_id'] = org_id
    task_dict['created_by'] = x_user_name
    task_obj = Task(**task_dict)
    doc = task_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.tasks.insert_one(doc)
    await log_action(org_id, x_user_name or "System", "created", "task", task_obj.id, task_obj.title)
    return task_obj

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(org_id: str = Depends(get_organization_id), project_id: Optional[str] = None, story_id: Optional[str] = None, status: Optional[str] = None, assigned_to: Optional[str] = None):
    query = {"organization_id": org_id}
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
async def get_task(task_id: str, org_id: str = Depends(get_organization_id)):
    task = await db.tasks.find_one({"id": task_id, "organization_id": org_id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if isinstance(task['created_at'], str):
        task['created_at'] = datetime.fromisoformat(task['created_at'])
    if isinstance(task['updated_at'], str):
        task['updated_at'] = datetime.fromisoformat(task['updated_at'])
    return task

@api_router.patch("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, input: TaskUpdate, org_id: str = Depends(get_organization_id), x_user_name: Optional[str] = Header(None)):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    old_task = await db.tasks.find_one({"id": task_id, "organization_id": org_id}, {"_id": 0})
    
    result = await db.tasks.update_one({"id": task_id, "organization_id": org_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if isinstance(task['created_at'], str):
        task['created_at'] = datetime.fromisoformat(task['created_at'])
    if isinstance(task['updated_at'], str):
        task['updated_at'] = datetime.fromisoformat(task['updated_at'])
    
    action = "updated"
    if 'status' in update_data and old_task and old_task['status'] != update_data['status']:
        action = "status_changed"
        update_data['old_status'] = old_task['status']
    elif 'assigned_to' in update_data:
        action = "assigned"
    
    await log_action(org_id, x_user_name or "System", action, "task", task_id, task['title'], update_data)
    return task

@api_router.post("/tasks/{task_id}/comments")
async def add_comment(task_id: str, input: CommentCreate, org_id: str = Depends(get_organization_id)):
    from pydantic import BaseModel
    class Comment(BaseModel):
        id: str = Field(default_factory=lambda: str(uuid.uuid4()))
        user: str
        text: str
        created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    
    comment = Comment(user=input.user, text=input.text)
    result = await db.tasks.update_one({"id": task_id, "organization_id": org_id}, {"$push": {"comments": comment.model_dump()}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    await log_action(org_id, input.user, "commented", "task", task_id, task['title'], {"comment": input.text})
    return {"message": "Comment added successfully", "comment": comment}

# Team Endpoints
@api_router.post("/team", response_model=TeamMember)
async def create_team_member(input: TeamMemberCreate, org_id: str = Depends(get_organization_id), x_user_name: Optional[str] = Header(None)):
    member_dict = input.model_dump()
    member_dict['organization_id'] = org_id
    member_obj = TeamMember(**member_dict)
    doc = member_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.team_members.insert_one(doc)
    await log_action(org_id, x_user_name or "System", "created", "team_member", member_obj.id, member_obj.name)
    return member_obj

@api_router.get("/team", response_model=List[TeamMember])
async def get_team_members(org_id: str = Depends(get_organization_id)):
    members = await db.team_members.find({"organization_id": org_id}, {"_id": 0}).to_list(1000)
    for member in members:
        if isinstance(member['created_at'], str):
            member['created_at'] = datetime.fromisoformat(member['created_at'])
    return members

@api_router.get("/team/{member_id}", response_model=TeamMember)
async def get_team_member(member_id: str, org_id: str = Depends(get_organization_id)):
    member = await db.team_members.find_one({"id": member_id, "organization_id": org_id}, {"_id": 0})
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    if isinstance(member['created_at'], str):
        member['created_at'] = datetime.fromisoformat(member['created_at'])
    return member

@api_router.patch("/team/{member_id}", response_model=TeamMember)
async def update_team_member(member_id: str, input: TeamMemberUpdate, org_id: str = Depends(get_organization_id), x_user_name: Optional[str] = Header(None)):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.team_members.update_one({"id": member_id, "organization_id": org_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    member = await db.team_members.find_one({"id": member_id}, {"_id": 0})
    if isinstance(member['created_at'], str):
        member['created_at'] = datetime.fromisoformat(member['created_at'])
    await log_action(org_id, x_user_name or "System", "updated", "team_member", member_id, member['name'], update_data)
    return member

@api_router.delete("/team/{member_id}")
async def delete_team_member(member_id: str, org_id: str = Depends(get_organization_id), x_user_name: Optional[str] = Header(None)):
    member = await db.team_members.find_one({"id": member_id, "organization_id": org_id}, {"_id": 0})
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    await db.team_members.delete_one({"id": member_id})
    await log_action(org_id, x_user_name or "System", "deleted", "team_member", member_id, member['name'])
    return {"message": "Team member deleted successfully"}

# Department Endpoints
@api_router.post("/departments", response_model=Department)
async def create_department(input: DepartmentCreate, org_id: str = Depends(get_organization_id), x_user_name: Optional[str] = Header(None)):
    dept_dict = input.model_dump()
    dept_dict['organization_id'] = org_id
    dept_obj = Department(**dept_dict)
    doc = dept_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.departments.insert_one(doc)
    await log_action(org_id, x_user_name or "System", "created", "department", dept_obj.id, dept_obj.name)
    return dept_obj

@api_router.get("/departments", response_model=List[Department])
async def get_departments(org_id: str = Depends(get_organization_id)):
    depts = await db.departments.find({"organization_id": org_id}, {"_id": 0}).to_list(1000)
    for dept in depts:
        if isinstance(dept['created_at'], str):
            dept['created_at'] = datetime.fromisoformat(dept['created_at'])
    return depts

# Action History Endpoints
@api_router.get("/history")
async def get_action_history(org_id: str = Depends(get_organization_id), entity_type: Optional[str] = None, entity_id: Optional[str] = None, limit: int = 100):
    query = {"organization_id": org_id}
    if entity_type:
        query["entity_type"] = entity_type
    if entity_id:
        query["entity_id"] = entity_id
    
    history = await db.action_history.find(query, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    for entry in history:
        if isinstance(entry['timestamp'], str):
            entry['timestamp'] = datetime.fromisoformat(entry['timestamp'])
    return history

# Dashboard Endpoints
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(org_id: str = Depends(get_organization_id)):
    total_projects = await db.projects.count_documents({"organization_id": org_id})
    total_tasks = await db.tasks.count_documents({"organization_id": org_id})
    total_stories = await db.stories.count_documents({"organization_id": org_id})
    total_members = await db.team_members.count_documents({"organization_id": org_id})
    
    todo_tasks = await db.tasks.count_documents({"organization_id": org_id, "status": "TODO"})
    in_progress_tasks = await db.tasks.count_documents({"organization_id": org_id, "status": "IN_PROGRESS"})
    in_review_tasks = await db.tasks.count_documents({"organization_id": org_id, "status": "IN_REVIEW"})
    done_tasks = await db.tasks.count_documents({"organization_id": org_id, "status": "DONE"})
    
    high_priority = await db.tasks.count_documents({"organization_id": org_id, "priority": "High"})
    critical_priority = await db.tasks.count_documents({"organization_id": org_id, "priority": "Critical"})
    
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
async def get_weekly_summary(org_id: str = Depends(get_organization_id)):
    all_tasks = await db.tasks.find({"organization_id": org_id}, {"_id": 0}).to_list(1000)
    team_summary = {}
    for task in all_tasks:
        team = task.get('team', 'Development')
        if team not in team_summary:
            team_summary[team] = {"team": team, "total": 0, "done": 0, "in_progress": 0, "tasks": []}
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
async def get_team_performance(org_id: str = Depends(get_organization_id)):
    members = await db.team_members.find({"organization_id": org_id}, {"_id": 0}).to_list(1000)
    performance = []
    for member in members:
        member_tasks = await db.tasks.find({"organization_id": org_id, "assigned_to": member['name']}, {"_id": 0}).to_list(1000)
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
    return {"message": "TaskFlow Multi-Tenant API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()