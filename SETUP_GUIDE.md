# TaskFlow - Complete Setup Guide

## 🚀 Quick Start

### Step 1: Initialize Database

Run the initialization script to set up master data and create the super admin:

```bash
cd /app/scripts
python3 init_db.py
```

**What it creates:**
- ✅ Super Admin user (admin@gmail.com / 12345)
- ✅ Role master data (5 roles)
- ✅ Department templates (6 departments)
- ✅ Task types (4 types)
- ✅ Priorities (4 levels)
- ✅ Statuses (5 statuses)
- ✅ Database indexes for performance

### Step 2: Access the Application

1. Open your browser: `https://your-domain.preview.emergentagent.com`
2. You'll see the login page
3. Click "Fill Super Admin Credentials" or enter manually:
   - Email: `admin@gmail.com`
   - Password: `12345`
4. Click "Sign In"

### Step 3: Create Your First Organization

1. After login, you'll see the "Organizations" tab (SuperAdmin only)
2. Click "Create Organization"
3. Fill in the form:
   - **Organization Name**: e.g., "Acme Corp"
   - **Subdomain**: e.g., "acme" (will be acme.taskflow.com)
   - **Admin Name**: e.g., "John Doe"
   - **Admin Email**: e.g., "admin@acme.com"
   - **Logo** (optional): Upload your company logo
   - **Theme Colors**: Customize 5 colors for your brand
4. Click "Create Organization"
5. **Save the admin credentials shown in the dialog!**

### Step 4: Login as Organization Admin

1. Logout from SuperAdmin
2. Login with the organization admin credentials shown
3. You'll now see your organization's workspace

### Step 5: Set Up Your Team

1. Go to "Team" tab
2. Click "Add Member"
3. Fill in member details:
   - Name
   - Email
   - **Role**: Select from dropdown (Admin, Product, Developer, Ops)
   - **Department**: Select from dropdown (Frontend, Backend, QA, Product, Business, Ops)
4. Click "Add Member"
5. Repeat for all team members

### Step 6: Create Your First Project

1. Go to "Projects" tab
2. Click "New Project"
3. Enter project name and description
4. Click "Create Project"

### Step 7: Add Stories and Tasks

1. In Projects page, select your project
2. Go to "Stories" tab
3. Click "New Story"
4. Fill in story details (title, description, BRD, PRD, priority)
5. Go to "Tasks" tab
6. Click "New Task"
7. Fill in task details:
   - Title, description
   - Story (optional)
   - Assigned to (select team member)
   - Priority, Type, Team
   - Dates and story points
8. Click "Create Task"

## 🎭 Role-Based Access

### SuperAdmin
- **Can see**: Organizations tab, all system data
- **Can do**: Create organizations, view all org admin credentials, reset passwords
- **Cannot**: Access individual organization data directly

### Admin (Organization)
- **Can see**: All tabs except Organizations
- **Can do**: Manage team, view performance, manage departments, full CRUD on projects/stories/tasks
- **Cannot**: See other organizations' data

### Product Manager
- **Can see**: Dashboard, Projects, Kanban, TODO, Weekly
- **Can do**: Create projects, stories, tasks
- **Cannot**: Manage team, view performance

### Developer
- **Can see**: Dashboard, Projects, Kanban, TODO, Weekly
- **Can do**: Work on tasks, update task status, create tasks
- **Cannot**: Create projects, manage team

### Operations
- **Can see**: Dashboard, TODO, Weekly
- **Can do**: View and work on operational tasks
- **Cannot**: Create projects, manage team

## 🏢 Multi-Tenant Features

### Data Isolation
- Each organization has completely isolated data
- Users can only see data from their organization
- No cross-organization access possible
- SuperAdmin can manage all organizations but not their data

### Organization Management (SuperAdmin)
1. **View Credentials**: Click "View Credentials" on any org card to see admin email/password
2. **Reset Password**: Click "Reset Password" to generate new admin password
3. **Edit Settings**: Click "Settings" to update logo and theme
4. **Create Organization**: Add new organizations anytime

### Team Management (Org Admin)
1. **View Member**: Click on any team member card
2. **Edit Member**: Update name, email, role, or department
3. **Delete Member**: Remove team members (with confirmation)
4. **Role Selection**: Choose from 4 fixed roles (Admin, Product, Developer, Ops)
5. **Department Selection**: Assign to one of 6 departments

## 📊 Using the System

### Kanban Board
1. Go to Kanban Board
2. Select project from dropdown
3. View tasks in 4 columns: TODO, In Progress, In Review, Done
4. **Drag and drop** tasks between columns to update status
5. Click "Add Task" to create new task directly

### TODO List
1. Go to TODO List
2. See all tasks with TODO status
3. Click "Start Task" to move to In Progress
4. Click "Add Task" to create new task

### Weekly Summary
1. Go to Weekly Summary
2. See breakdown by department/team
3. View completed, in-progress tasks
4. See assigned members and dates
5. Track progress with visual indicators

### Performance Dashboard
1. Go to Performance (Admin only)
2. View individual team member metrics
3. See completion rates
4. Track story points
5. Monitor task distribution

### Story Detail View
1. In Projects, click on any story card
2. See full story details (BRD, PRD)
3. View all tasks linked to story
4. Click "Add Task" to create task for story
5. Click "Edit Story" to update details

## 🔧 Database Management

### View Database Stats
```bash
cd /app/scripts
python3 init_db.py
```
Shows current document counts in all collections.

### Reset Database (Development Only)
```bash
cd /app/scripts
python3 init_db.py --reset
```
**WARNING**: This deletes ALL data including organizations, projects, tasks!

### Backup Database
```bash
mongodump --uri="mongodb://connection-string" --db=taskflow_db
```

### Restore Database
```bash
mongorestore --uri="mongodb://connection-string" --db=taskflow_db dump/taskflow_db
```

## 🎨 Customization

### Organization Theme
1. SuperAdmin or Org Admin: Go to Organization Settings
2. Upload custom logo (shows in sidebar)
3. Select 5 custom colors:
   - Primary Color (main buttons, highlights)
   - Secondary Color (secondary actions)
   - Accent Color (hover states, accents)
   - Background Color (page background)
   - Sidebar Color (navigation sidebar)
4. Save changes
5. Theme applies to entire organization

### Department Colors
1. Go to Departments tab
2. Create custom departments
3. Assign colors for visual identification
4. Use in task assignment

## 📱 API Integration

### Headers Required
All API calls (except login) require these headers:
```javascript
{
  'X-Organization-ID': 'org-id',
  'X-User-Name': 'user-name',
  'X-User-Role': 'role'
}
```

### Authentication Endpoint
```
POST /api/auth/login
Body: { "email": "...", "password": "..." }
Response: { "user": {...}, "organization": {...}, "token": "..." }
```

### API Documentation
See `/app/backend/server.py` for all available endpoints.

## 🔒 Security Notes

### Passwords
- All passwords hashed with SHA-256
- Super admin password: Change after first login
- Org admin passwords: Auto-generated, shown once
- Reset available through SuperAdmin

### Access Control
- Role-based permissions enforced in backend
- Frontend hides/shows UI based on role
- API validates user role on every request
- Organization isolation enforced by MongoDB queries

### Data Privacy
- Each organization's data is completely isolated
- Cross-organization queries prevented at database level
- Action history tracks all changes
- Audit trail for compliance

## 🐛 Troubleshooting

### Login Issues
- Verify email/password are correct
- Check if user account is active
- Ensure you're using correct organization subdomain

### Task Creation Errors
- Ensure all required fields are filled
- Check that project and story exist
- Verify team member exists for assignment
- Make sure you have permission (role check)

### Data Not Showing
- Verify you're logged into correct organization
- Check your role permissions
- Refresh the page
- Check browser console for errors

### Performance Issues
- Run database initialization to create indexes
- Check MongoDB connection
- Monitor server logs: `tail -f /var/log/supervisor/backend.err.log`

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review `/app/scripts/README.md` for database scripts
3. Check server logs for errors
4. Review MongoDB collections directly

## 🎉 Best Practices

### For SuperAdmin
1. Create organizations with meaningful subdomains
2. Save admin credentials immediately
3. Provide credentials to org admins securely
4. Reset passwords only when necessary
5. Monitor organization count and activity

### For Org Admin
1. Set up team structure first
2. Create departments matching your org
3. Assign appropriate roles to team members
4. Create projects with clear descriptions
5. Use stories to organize large features
6. Set up weekly reviews of team performance

### For All Users
1. Update task status regularly
2. Use comments for communication
3. Set realistic story points
4. Link related tasks together
5. Use priority levels appropriately
6. Keep descriptions clear and detailed

## ✅ Checklist

- [ ] Run database initialization script
- [ ] Login as SuperAdmin
- [ ] Create first organization
- [ ] Save org admin credentials
- [ ] Login as org admin
- [ ] Add team members with roles
- [ ] Create first project
- [ ] Add stories to project
- [ ] Create tasks for stories
- [ ] Test Kanban drag-and-drop
- [ ] Review weekly summary
- [ ] Check performance dashboard

Your TaskFlow system is now ready for production use! 🚀
