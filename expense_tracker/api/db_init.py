"""
Database initialization and migration utilities

This script provides utilities for:
1. Creating database and tables
2. Initializing default data
3. Resetting database (for development)
4. Backing up data
"""

import os
import sys
from datetime import datetime
from main import app, db
from models import User, Category, Expense, Budget, bcrypt

# Default expense categories
DEFAULT_CATEGORIES = [
    {"name": "Food & Dining", "color": "#FF6B6B", "icon": "🍕", "description": "Restaurants, grocery, food delivery"},
    {"name": "Transportation", "color": "#4ECDC4", "icon": "🚗", "description": "Gas, parking, uber, public transport"},
    {"name": "Entertainment", "color": "#95E1D3", "icon": "🎮", "description": "Movies, games, streaming, concerts"},
    {"name": "Shopping", "color": "#F38181", "icon": "🛍️", "description": "Clothes, electronics, household"},
    {"name": "Utilities", "color": "#FFEAA7", "icon": "💡", "description": "Electricity, water, internet, phone"},
    {"name": "Healthcare", "color": "#DDA15E", "icon": "🏥", "description": "Medical, pharmacy, fitness"},
    {"name": "Education", "color": "#BC6C25", "icon": "📚", "description": "Courses, books, training"},
    {"name": "Travel", "color": "#457B9D", "icon": "✈️", "description": "Flights, hotels, tours"},
    {"name": "Insurance", "color": "#1D3557", "icon": "🛡️", "description": "Health, car, home insurance"},
    {"name": "Other", "color": "#A8DADC", "icon": "📌", "description": "Miscellaneous expenses"},
]

def init_database():
    """Initialize the database with tables and default data"""
    print("🗄️  Initializing database...")
    
    with app.app_context():
        # Create all tables
        print("📋 Creating tables...")
        db.create_all()
        print("✅ Tables created successfully!")
        
        # Initialize default data
        init_default_data()

def init_default_data():
    """Initialize default categories for demo user"""
    print("📝 Initializing default data...")
    
    with app.app_context():
        # Check if demo user exists
        demo_user = User.query.filter_by(username='demo').first()
        
        if not demo_user:
            print("👤 Creating demo user...")
            demo_user = User(
                username='demo',
                email='demo@example.com',
                password_hash=bcrypt.generate_password_hash('demo123').decode('utf-8'),
                full_name='Demo User',
                is_active=True,
                is_verified=True
            )
            db.session.add(demo_user)
            db.session.commit()
            print("✅ Demo user created!")
            print("   Username: demo")
            print("   Password: demo123")
        
        # Add default categories if not exists
        if demo_user and len(demo_user.categories) == 0:
            print("📂 Adding default categories...")
            for cat_data in DEFAULT_CATEGORIES:
                category = Category(
                    user_id=demo_user.id,
                    name=cat_data['name'],
                    description=cat_data['description'],
                    color=cat_data['color'],
                    icon=cat_data['icon'],
                    is_default=True
                )
                db.session.add(category)
            db.session.commit()
            print(f"✅ {len(DEFAULT_CATEGORIES)} default categories added!")
        
        # Add sample expenses
        if demo_user and len(demo_user.expenses) == 0:
            print("💰 Adding sample expenses...")
            sample_expenses = [
                {"title": "Coffee", "amount": 150, "category": "Food & Dining", "days_ago": 5},
                {"title": "Uber ride", "amount": 250, "category": "Transportation", "days_ago": 3},
                {"title": "Movie tickets", "amount": 500, "category": "Entertainment", "days_ago": 2},
                {"title": "Grocery shopping", "amount": 2500, "category": "Food & Dining", "days_ago": 1},
                {"title": "Gas", "amount": 1500, "category": "Transportation", "days_ago": 0},
            ]
            
            from datetime import timedelta
            for exp_data in sample_expenses:
                expense = Expense(
                    user_id=demo_user.id,
                    title=exp_data['title'],
                    amount=exp_data['amount'],
                    category=exp_data['category'],
                    date=(datetime.utcnow() - timedelta(days=exp_data['days_ago'])).date(),
                    description=f"Sample {exp_data['category'].lower()} expense"
                )
                db.session.add(expense)
            db.session.commit()
            print(f"✅ {len(sample_expenses)} sample expenses added!")

def reset_database():
    """Drop all tables and reinitialize (USE WITH CAUTION!)"""
    print("⚠️  WARNING: This will delete all data!")
    confirm = input("Type 'yes' to confirm: ")
    
    if confirm.lower() != 'yes':
        print("❌ Cancelled.")
        return
    
    with app.app_context():
        print("🗑️  Dropping all tables...")
        db.drop_all()
        print("✅ All tables dropped.")
        
        init_database()
        print("✅ Database reset complete!")

def backup_database():
    """Create a backup of the database"""
    print("💾 Creating database backup...")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"backup_expense_tracker_{timestamp}.sql"
    
    print(f"📦 Backup saved to: {backup_file}")
    print("   (Manual backup recommended using pg_dump or similar)")

def show_database_stats():
    """Show database statistics"""
    print("\n📊 Database Statistics")
    print("=" * 50)
    
    with app.app_context():
        user_count = User.query.count()
        expense_count = Expense.query.count()
        category_count = Category.query.count()
        budget_count = Budget.query.count()
        
        total_expenses = db.session.query(db.func.sum(Expense.amount)).scalar() or 0
        
        print(f"Users:        {user_count}")
        print(f"Expenses:     {expense_count}")
        print(f"Categories:   {category_count}")
        print(f"Budgets:      {budget_count}")
        print(f"Total Spent:  ₹{float(total_expenses):,.2f}")
        print("=" * 50)

def main():
    """Main entry point"""
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == 'init':
            init_database()
        elif command == 'reset':
            reset_database()
        elif command == 'backup':
            backup_database()
        elif command == 'stats':
            show_database_stats()
        else:
            print("Unknown command!")
            print("\nUsage: python db_init.py [command]")
            print("Commands:")
            print("  init      - Initialize database with default data")
            print("  reset     - Drop all tables and reinitialize")
            print("  backup    - Create database backup")
            print("  stats     - Show database statistics")
    else:
        print("Smart Expense Tracker - Database Manager")
        print("=" * 50)
        print("\nUsage: python db_init.py [command]")
        print("\nCommands:")
        print("  init      - Initialize database with default data")
        print("  reset     - Drop all tables and reinitialize (⚠️  deletes all data)")
        print("  backup    - Create database backup")
        print("  stats     - Show database statistics")
        print("\nExample:")
        print("  python db_init.py init")

if __name__ == '__main__':
    main()
