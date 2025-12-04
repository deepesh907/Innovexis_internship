from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime
import uuid

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    """User model for storing user information"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(100), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Profile information
    full_name = db.Column(db.String(100), nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    
    # Account status
    is_active = db.Column(db.Boolean, default=True, index=True)
    is_verified = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    expenses = db.relationship('Expense', backref='owner', lazy=True, cascade='all, delete-orphan')
    categories = db.relationship('Category', backref='owner', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active
        }


class Category(db.Model):
    """Category model for expense categories"""
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    color = db.Column(db.String(7), default='#667eea')  # Hex color
    icon = db.Column(db.String(50), nullable=True)  # Emoji or icon name
    
    # Track custom vs default
    is_default = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    expenses = db.relationship('Expense', backref='category_ref', lazy=True, cascade='all, delete-orphan')
    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'name', name='unique_category_per_user'),
    )
    
    def __repr__(self):
        return f'<Category {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'icon': self.icon,
            'is_default': self.is_default
        }


class Expense(db.Model):
    """Expense model for storing expense records"""
    __tablename__ = 'expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    
    # Expense details
    title = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    amount = db.Column(db.DECIMAL(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='INR')  # ISO 4217 currency code
    
    # Category (legacy, for backward compatibility)
    category = db.Column(db.String(100), nullable=True)
    
    # Dates
    date = db.Column(db.Date, nullable=False, index=True, default=datetime.utcnow)
    
    # Expense metadata
    receipt_url = db.Column(db.String(255), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    is_recurring = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Expense {self.title} - ₹{self.amount}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'amount': float(self.amount),
            'category': self.category,
            'date': self.date.isoformat(),
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'currency': self.currency
        }


class Budget(db.Model):
    """Budget model for tracking budget limits"""
    __tablename__ = 'budgets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    
    # Budget details
    name = db.Column(db.String(100), nullable=False)
    limit_amount = db.Column(db.DECIMAL(10, 2), nullable=False)
    spent_amount = db.Column(db.DECIMAL(10, 2), default=0)
    currency = db.Column(db.String(3), default='INR')
    
    # Period
    period = db.Column(db.String(20), default='monthly')  # daily, weekly, monthly, yearly
    start_date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    end_date = db.Column(db.Date, nullable=True)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Budget {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'limit_amount': float(self.limit_amount),
            'spent_amount': float(self.spent_amount),
            'period': self.period,
            'is_active': self.is_active
        }
