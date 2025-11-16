#!/usr/bin/env python3
"""
Database Initialization Script for TaskFlow
Creates super admin user and initial master data
Run this script after deploying the application for the first time
"""

import asyncio
import os
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import hashlib
import uuid

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'backend'))

from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

async def init_database():
    """Initialize database with master data"""
    print("=" * 60)
    print("TaskFlow Database Initialization Script")
    print("=" * 60)
    print()
    
    # Connect to MongoDB
    print("🔌 Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    print("✓ Connected successfully")
    print()
    
    try:
        # 1. Create Super Admin User
        print("👤 Creating Super Admin User...")
        existing_admin = await db.users.find_one({"email": "admin@gmail.com"})
        
        if existing_admin:
            print("⚠️  Super Admin already exists")
            print(f"   Email: admin@gmail.com")
        else:
            super_admin = {
                "id": str(uuid.uuid4()),
                "name": "Super Admin",
                "email": "admin@gmail.com",
                "password": hash_password("12345"),
                "role": "SuperAdmin",
                "organization_id": None,
                "avatar": "",
                "temp_password": "12345",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "is_active": True
            }
            await db.users.insert_one(super_admin)
            print("✓ Super Admin created successfully")
            print(f"   Email: admin@gmail.com")
            print(f"   Password: 12345")
        print()
        
        # 2. Create Role Master Data
        print("🎭 Creating Role Master Data...")
        roles = [
            {
                "id": str(uuid.uuid4()),
                "name": "SuperAdmin",
                "description": "Super administrator with full system access",
                "permissions": ["all"],
                "level": 0
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Admin",
                "description": "Organization administrator",
                "permissions": ["org_admin", "manage_users", "manage_projects", "manage_teams"],
                "level": 1
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Product",
                "description": "Product manager - can create projects, stories, and tasks",
                "permissions": ["create_project", "create_story", "create_task", "view_reports"],
                "level": 2
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Developer",
                "description": "Developer - can work on tasks and update status",
                "permissions": ["update_task", "create_task", "view_tasks", "comment"],
                "level": 3
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Ops",
                "description": "Operations - can view and manage operational tasks",
                "permissions": ["view_tasks", "update_status", "comment"],
                "level": 4
            }
        ]
        
        # Clear existing roles
        await db.roles.delete_many({})
        await db.roles.insert_many(roles)
        print("✓ Role master data created")
        for role in roles:
            print(f"   - {role['name']}: {role['description']}")
        print()
        
        # 3. Create Department Master Data
        print("🏢 Creating Department Master Data...")
        departments_master = [
            {
                "id": str(uuid.uuid4()),
                "name": "Frontend",
                "description": "Frontend development team",
                "color": "#3B82F6",
                "is_default": True
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Backend",
                "description": "Backend development team",
                "color": "#8B5CF6",
                "is_default": True
            },
            {
                "id": str(uuid.uuid4()),
                "name": "QA",
                "description": "Quality Assurance team",
                "color": "#10B981",
                "is_default": True
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Product",
                "description": "Product management team",
                "color": "#F59E0B",
                "is_default": True
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Business",
                "description": "Business analysis team",
                "color": "#EF4444",
                "is_default": True
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Ops",
                "description": "Operations team",
                "color": "#14B8A6",
                "is_default": True
            }
        ]
        
        # Clear existing department templates
        await db.department_templates.delete_many({})
        await db.department_templates.insert_many(departments_master)
        print("✓ Department master data created")
        for dept in departments_master:
            print(f"   - {dept['name']}: {dept['description']}")
        print()
        
        # 4. Create Task Type Master Data
        print("📋 Creating Task Type Master Data...")
        task_types = [
            {
                "id": str(uuid.uuid4()),
                "name": "Task",
                "description": "General task",
                "icon": "📝",
                "color": "#3B82F6"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Bug",
                "description": "Bug fix task",
                "icon": "🐛",
                "color": "#EF4444"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "HotFix",
                "description": "Urgent hotfix task",
                "icon": "🔥",
                "color": "#DC2626"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Feature",
                "description": "New feature implementation",
                "icon": "✨",
                "color": "#8B5CF6"
            }
        ]
        
        await db.task_types.delete_many({})
        await db.task_types.insert_many(task_types)
        print("✓ Task type master data created")
        for task_type in task_types:
            print(f"   - {task_type['name']}: {task_type['description']}")
        print()
        
        # 5. Create Priority Master Data
        print("⚡ Creating Priority Master Data...")
        priorities = [
            {
                "id": str(uuid.uuid4()),
                "name": "Low",
                "description": "Low priority",
                "level": 1,
                "color": "#3B82F6"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Medium",
                "description": "Medium priority",
                "level": 2,
                "color": "#F59E0B"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "High",
                "description": "High priority",
                "level": 3,
                "color": "#EF4444"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Critical",
                "description": "Critical priority - immediate attention required",
                "level": 4,
                "color": "#DC2626"
            }
        ]
        
        await db.priorities.delete_many({})
        await db.priorities.insert_many(priorities)
        print("✓ Priority master data created")
        for priority in priorities:
            print(f"   - {priority['name']} (Level {priority['level']}): {priority['description']}")
        print()
        
        # 6. Create Status Master Data
        print("📊 Creating Status Master Data...")
        statuses = [
            {
                "id": str(uuid.uuid4()),
                "name": "TODO",
                "description": "Task not yet started",
                "order": 1,
                "color": "#6B7280"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "IN_PROGRESS",
                "description": "Task currently in progress",
                "order": 2,
                "color": "#3B82F6"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "IN_REVIEW",
                "description": "Task under review",
                "order": 3,
                "color": "#F59E0B"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "DONE",
                "description": "Task completed",
                "order": 4,
                "color": "#10B981"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "BLOCKED",
                "description": "Task is blocked",
                "order": 5,
                "color": "#EF4444"
            }
        ]
        
        await db.statuses.delete_many({})
        await db.statuses.insert_many(statuses)
        print("✓ Status master data created")
        for status in statuses:
            print(f"   - {status['name']}: {status['description']}")
        print()
        
        # 7. Create Indexes for Performance
        print("🔍 Creating Database Indexes...")
        
        # Users indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("organization_id")
        await db.users.create_index([("role", 1), ("organization_id", 1)])
        print("✓ Users indexes created")
        
        # Organizations indexes
        await db.organizations.create_index("subdomain", unique=True)
        print("✓ Organizations indexes created")
        
        # Projects indexes
        await db.projects.create_index("organization_id")
        await db.projects.create_index([("organization_id", 1), ("created_at", -1)])
        print("✓ Projects indexes created")
        
        # Tasks indexes
        await db.tasks.create_index("organization_id")
        await db.tasks.create_index([("organization_id", 1), ("status", 1)])
        await db.tasks.create_index([("organization_id", 1), ("assigned_to", 1)])
        await db.tasks.create_index([("organization_id", 1), ("project_id", 1)])
        await db.tasks.create_index([("organization_id", 1), ("story_id", 1)])
        print("✓ Tasks indexes created")
        
        # Action history indexes
        await db.action_history.create_index("organization_id")
        await db.action_history.create_index([("organization_id", 1), ("timestamp", -1)])
        await db.action_history.create_index([("entity_type", 1), ("entity_id", 1)])
        print("✓ Action history indexes created")
        
        # Team members indexes
        await db.team_members.create_index("organization_id")
        await db.team_members.create_index([("organization_id", 1), ("email", 1)])
        print("✓ Team members indexes created")
        
        print()
        
        # 8. Database Statistics
        print("📈 Database Statistics:")
        collections_stats = {
            "users": await db.users.count_documents({}),
            "roles": await db.roles.count_documents({}),
            "department_templates": await db.department_templates.count_documents({}),
            "task_types": await db.task_types.count_documents({}),
            "priorities": await db.priorities.count_documents({}),
            "statuses": await db.statuses.count_documents({}),
            "organizations": await db.organizations.count_documents({}),
            "projects": await db.projects.count_documents({}),
            "stories": await db.stories.count_documents({}),
            "tasks": await db.tasks.count_documents({}),
            "team_members": await db.team_members.count_documents({}),
        }
        
        for collection, count in collections_stats.items():
            print(f"   {collection}: {count} documents")
        print()
        
        # Success Summary
        print("=" * 60)
        print("✅ Database Initialization Complete!")
        print("=" * 60)
        print()
        print("🔑 Super Admin Credentials:")
        print("   Email: admin@gmail.com")
        print("   Password: 12345")
        print()
        print("📝 Next Steps:")
        print("   1. Login with super admin credentials")
        print("   2. Create your first organization")
        print("   3. Organization admin will be created automatically")
        print("   4. Start adding team members and projects")
        print()
        print("🚀 Your TaskFlow system is ready to use!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error during initialization: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        client.close()
    
    return True

async def reset_database():
    """Reset database - WARNING: Deletes all data"""
    print("=" * 60)
    print("⚠️  DATABASE RESET - THIS WILL DELETE ALL DATA")
    print("=" * 60)
    print()
    
    response = input("Are you sure you want to reset the database? (type 'YES' to confirm): ")
    if response != "YES":
        print("❌ Reset cancelled")
        return
    
    print()
    print("🗑️  Resetting database...")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Drop all collections
        collections = await db.list_collection_names()
        for collection in collections:
            await db[collection].drop()
            print(f"   Dropped: {collection}")
        
        print()
        print("✓ Database reset complete")
        print()
        print("Running initialization...")
        print()
        
        # Re-initialize
        await init_database()
        
    except Exception as e:
        print(f"❌ Error during reset: {str(e)}")
    finally:
        client.close()

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='TaskFlow Database Initialization')
    parser.add_argument('--reset', action='store_true', help='Reset database (WARNING: deletes all data)')
    
    args = parser.parse_args()
    
    if args.reset:
        asyncio.run(reset_database())
    else:
        asyncio.run(init_database())

if __name__ == "__main__":
    main()
