#!/usr/bin/env python
"""
Database migration helper script.

Usage:
    python db_migrate.py init         # Initialize Alembic (one-time)
    python db_migrate.py upgrade      # Apply pending migrations
    python db_migrate.py downgrade 1  # Rollback one migration
    python db_migrate.py current      # Show current migration version
    python db_migrate.py history      # Show all migrations
    python db_migrate.py autogenerate "description"  # Auto-generate migration from model changes
"""

import sys
import subprocess
from pathlib import Path

def run_alembic_command(command):
    """Execute an alembic command."""
    try:
        result = subprocess.run(
            f"alembic {command}",
            shell=True,
            cwd=Path(__file__).parent,
            capture_output=False,
            text=True
        )
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running alembic: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "init":
        print("✅ Initializing Alembic repository...")
        run_alembic_command("init migrations -t generic")
    
    elif command == "upgrade":
        print("✅ Applying all pending migrations...")
        run_alembic_command("upgrade head")
    
    elif command == "downgrade":
        if len(sys.argv) < 3:
            print("❌ Please specify number of revisions to downgrade (e.g., 'python db_migrate.py downgrade 1')")
            sys.exit(1)
        steps = sys.argv[2]
        print(f"✅ Rolling back {steps} revision(s)...")
        run_alembic_command(f"downgrade -{steps}")
    
    elif command == "current":
        print("📍 Current migration version...")
        run_alembic_command("current")
    
    elif command == "history":
        print("📜 Migration history...")
        run_alembic_command("history")
    
    elif command == "autogenerate":
        if len(sys.argv) < 3:
            print("❌ Please provide a migration description (e.g., 'python db_migrate.py autogenerate \"add user email\"')")
            sys.exit(1)
        description = sys.argv[2]
        print(f"✅ Auto-generating migration: {description}")
        run_alembic_command(f'revision --autogenerate -m "{description}"')
    
    else:
        print(f"❌ Unknown command: {command}")
        print(__doc__)
        sys.exit(1)

if __name__ == "__main__":
    main()
