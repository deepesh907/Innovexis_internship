"""Initial migration: Create all tables

Revision ID: 001_initial
Revises: 
Create Date: 2024-12-01 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create all base tables for the expense tracker."""
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(36), nullable=True),
        sa.Column('username', sa.String(100), nullable=False),
        sa.Column('email', sa.String(120), nullable=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(100), nullable=True),
        sa.Column('avatar_url', sa.String(255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('uuid'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email'),
    )
    op.create_index('ix_users_username', 'users', ['username'])
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_is_active', 'users', ['is_active'])
    op.create_index('ix_users_created_at', 'users', ['created_at'])
    
    # Create categories table
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('color', sa.String(7), nullable=False, server_default='#667eea'),
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('is_default', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'name', name='unique_category_per_user'),
    )
    op.create_index('ix_categories_user_id', 'categories', ['user_id'])
    
    # Create expenses table
    op.create_table(
        'expenses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(36), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('amount', sa.DECIMAL(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), nullable=False, server_default='INR'),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('receipt_url', sa.String(255), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_recurring', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('uuid'),
    )
    op.create_index('ix_expenses_user_id', 'expenses', ['user_id'])
    op.create_index('ix_expenses_title', 'expenses', ['title'])
    op.create_index('ix_expenses_date', 'expenses', ['date'])
    op.create_index('ix_expenses_created_at', 'expenses', ['created_at'])
    
    # Create budgets table
    op.create_table(
        'budgets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('limit_amount', sa.DECIMAL(10, 2), nullable=False),
        sa.Column('spent_amount', sa.DECIMAL(10, 2), nullable=False, server_default='0'),
        sa.Column('currency', sa.String(3), nullable=False, server_default='INR'),
        sa.Column('start_date', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_budgets_user_id', 'budgets', ['user_id'])


def downgrade() -> None:
    """Drop all tables."""
    op.drop_index('ix_budgets_user_id')
    op.drop_table('budgets')
    
    op.drop_index('ix_expenses_created_at')
    op.drop_index('ix_expenses_date')
    op.drop_index('ix_expenses_title')
    op.drop_index('ix_expenses_user_id')
    op.drop_table('expenses')
    
    op.drop_index('ix_categories_user_id')
    op.drop_table('categories')
    
    op.drop_index('ix_users_created_at')
    op.drop_index('ix_users_is_active')
    op.drop_index('ix_users_email')
    op.drop_index('ix_users_username')
    op.drop_table('users')
