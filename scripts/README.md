# TaskFlow Database Initialization Scripts

## Overview

This directory contains database initialization and management scripts for TaskFlow.

## Scripts

### `init_db.py` - Database Initialization

Initializes the MongoDB database with all master data and creates the super admin user.

#### Features

- ✅ Creates Super Admin user (admin@gmail.com / 12345)
- ✅ Initializes Role master data (SuperAdmin, Admin, Product, Developer, Ops)
- ✅ Initializes Department templates (Frontend, Backend, QA, Product, Business, Ops)
- ✅ Initializes Task Type master data (Task, Bug, HotFix, Feature)
- ✅ Initializes Priority master data (Low, Medium, High, Critical)
- ✅ Initializes Status master data (TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED)
- ✅ Creates database indexes for performance
- ✅ Provides database statistics

#### Usage

**Initialize Database (First Time Setup):**
```bash
cd /app/scripts
python3 init_db.py
```

**Reset Database (WARNING: Deletes all data):**
```bash
python3 init_db.py --reset
```

#### What Gets Created

**1. Super Admin User**
- Email: `admin@gmail.com`
- Password: `12345`
- Role: `SuperAdmin`
- Full system access

**2. Role Master Data**
| Role | Description | Permissions |
|------|-------------|-------------|
| SuperAdmin | Super administrator | Full system access |
| Admin | Organization administrator | Organization management |
| Product | Product manager | Create projects, stories, tasks |
| Developer | Developer | Update tasks, change status |
| Ops | Operations | View and manage operational tasks |

**3. Department Templates**
- Frontend (Blue)
- Backend (Purple)
- QA (Green)
- Product (Orange)
- Business (Red)
- Ops (Teal)

**4. Task Types**
- Task (📝 Blue)
- Bug (🐛 Red)
- HotFix (🔥 Dark Red)
- Feature (✨ Purple)

**5. Priorities**
- Low (Level 1, Blue)
- Medium (Level 2, Orange)
- High (Level 3, Red)
- Critical (Level 4, Dark Red)

**6. Statuses**
- TODO (Gray)
- IN_PROGRESS (Blue)
- IN_REVIEW (Orange)
- DONE (Green)
- BLOCKED (Red)

**7. Database Indexes**
- User indexes (email, organization_id, role)
- Organization indexes (subdomain)
- Project indexes (organization_id, created_at)
- Task indexes (organization_id, status, assigned_to, project_id, story_id)
- Action history indexes (organization_id, timestamp, entity)
- Team member indexes (organization_id, email)

#### Output Example

```
============================================================
TaskFlow Database Initialization Script
============================================================

🔌 Connecting to MongoDB...
✓ Connected successfully

👤 Creating Super Admin User...
✓ Super Admin created successfully
   Email: admin@gmail.com
   Password: 12345

🎭 Creating Role Master Data...
✓ Role master data created
   - SuperAdmin: Super administrator with full system access
   - Admin: Organization administrator
   - Product: Product manager - can create projects, stories, and tasks
   - Developer: Developer - can work on tasks and update status
   - Ops: Operations - can view and manage operational tasks

🏢 Creating Department Master Data...
✓ Department master data created
   - Frontend: Frontend development team
   - Backend: Backend development team
   - QA: Quality Assurance team
   - Product: Product management team
   - Business: Business analysis team
   - Ops: Operations team

📋 Creating Task Type Master Data...
✓ Task type master data created
   - Task: General task
   - Bug: Bug fix task
   - HotFix: Urgent hotfix task
   - Feature: New feature implementation

⚡ Creating Priority Master Data...
✓ Priority master data created
   - Low (Level 1): Low priority
   - Medium (Level 2): Medium priority
   - High (Level 3): High priority
   - Critical (Level 4): Critical priority - immediate attention required

📊 Creating Status Master Data...
✓ Status master data created
   - TODO: Task not yet started
   - IN_PROGRESS: Task currently in progress
   - IN_REVIEW: Task under review
   - DONE: Task completed
   - BLOCKED: Task is blocked

🔍 Creating Database Indexes...
✓ Users indexes created
✓ Organizations indexes created
✓ Projects indexes created
✓ Tasks indexes created
✓ Action history indexes created
✓ Team members indexes created

📈 Database Statistics:
   users: 1 documents
   roles: 5 documents
   department_templates: 6 documents
   task_types: 4 documents
   priorities: 4 documents
   statuses: 5 documents
   organizations: 0 documents
   projects: 0 documents
   stories: 0 documents
   tasks: 0 documents
   team_members: 0 documents

============================================================
✅ Database Initialization Complete!
============================================================

🔑 Super Admin Credentials:
   Email: admin@gmail.com
   Password: 12345

📝 Next Steps:
   1. Login with super admin credentials
   2. Create your first organization
   3. Organization admin will be created automatically
   4. Start adding team members and projects

🚀 Your TaskFlow system is ready to use!
============================================================
```

#### When to Run

**Run this script:**
- ✅ First time deployment
- ✅ After database migration
- ✅ When setting up development environment
- ✅ When resetting to clean state

**Don't run in production if:**
- ❌ Database already has data
- ❌ Super admin already exists (script will skip creation)

#### Safety Features

- Idempotent: Can be run multiple times safely
- Checks for existing super admin before creating
- Requires explicit confirmation for reset
- Creates indexes for optimal performance
- Provides detailed feedback and statistics

#### Troubleshooting

**Connection Error:**
```
Check MongoDB connection string in /app/backend/.env
Ensure MONGO_URL is correct
```

**Permission Error:**
```
Make script executable:
chmod +x /app/scripts/init_db.py
```

**Import Error:**
```
Ensure all dependencies are installed:
cd /app/backend
pip install -r requirements.txt
```

## Environment Variables Required

The script uses environment variables from `/app/backend/.env`:
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name

## Notes

- All passwords are hashed using SHA-256
- Super admin password can be changed after first login
- Master data provides foundation for the application
- Indexes improve query performance significantly
- Reset functionality is for development only

## Support

For issues or questions, refer to the main project documentation.
