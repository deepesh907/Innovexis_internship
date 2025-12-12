from flask import Blueprint, request, jsonify
from models import db, Expense
from datetime import datetime

expenses = Blueprint("expenses", __name__)

@expenses.route("/api/expense/add", methods=["POST"])
def add_expense():
    try:
        data = request.json
        if not data or not data.get("title") or not data.get("amount") or not data.get("user_id") or not data.get("date"):
            return jsonify({"error": "Missing required fields: title, amount, user_id, date"}), 400
        
        expense = Expense(
            title=data["title"],
            amount=float(data["amount"]),
            category=data.get("category", "Other"),
            date=datetime.strptime(data["date"], "%Y-%m-%d"),
            user_id=int(data["user_id"])
        )
        db.session.add(expense)
        db.session.commit()
        return jsonify({"message": "Expense added", "id": expense.id}), 201
    except ValueError as e:
        return jsonify({"error": f"Invalid data format: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to add expense: {str(e)}"}), 500

@expenses.route("/api/expenses/<int:user_id>")
def get_expenses(user_id):
    from datetime import datetime
    
    # Get optional query parameters for date filtering
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Expense.query.filter_by(user_id=user_id)
    
    # Apply date filters if provided
    if start_date:
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
        query = query.filter(Expense.date >= start_date_obj)
    
    if end_date:
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
        query = query.filter(Expense.date <= end_date_obj)
    
    expenses_list = query.all()
    output = []
    for e in expenses_list:
        output.append({
            "id": e.id,
            "title": e.title,
            "amount": e.amount,
            "category": e.category,
            "date": e.date.strftime("%Y-%m-%d")
        })
    return jsonify(output)

@expenses.route("/api/expense/delete/<int:id>", methods=["DELETE"])
def delete_expense(id):
    exp = Expense.query.get(id)
    db.session.delete(exp)
    db.session.commit()
    return jsonify({"message": "Deleted"})
