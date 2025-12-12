import { useEffect, useState } from "react";
import axios from "axios";

export default function Expense({ user_id, refresh, dateFilter, onExpenseDeleted }) {

    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isDeleting, setIsDeleting] = useState(null);
    const [error, setError] = useState(null);

    const fetchExpenses = async () => {
        try {
            setError(null);
            let url = `http://localhost:5000/api/expenses/${user_id}`;

            if (dateFilter?.startDate && dateFilter?.endDate) {
                url += `?start_date=${dateFilter.startDate}&end_date=${dateFilter.endDate}`;
            }

            const res = await axios.get(url);
            setExpenses(res.data || []);

            const uniqueCategories = [...new Set((res.data || []).map((exp) => exp.category))];
            setCategories(uniqueCategories);
        } catch (err) {
            console.error("Error fetching expenses:", err);
            setError(err?.response?.data?.error || "Failed to load expenses");
            setExpenses([]);
        }
    };

    const deleteExpense = async (expenseId) => {
        if (window.confirm("Are you sure you want to delete this expense?")) {
            setIsDeleting(expenseId);
            try {
                await axios.delete(`http://localhost:5000/api/expense/delete/${expenseId}`);
                alert(" Expense deleted successfully!");
                fetchExpenses();
                if (onExpenseDeleted) {
                    onExpenseDeleted();
                }
            } catch (error) {
                console.error(error);
                alert(" Error deleting expense.");
            } finally {
                setIsDeleting(null);
            }
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [user_id, refresh, dateFilter]);

    const filteredExpenses = selectedCategory === "all"
        ? expenses
        : expenses.filter((exp) => exp.category === selectedCategory);

    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    return (
        <div className="card bg-white/95 backdrop-blur-xl border border-white/20">

            {error && (
                <div className="alert alert-warning mb-4">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="title">Expense List</h2>
                <div className="text-right">
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        ₹{(Number(totalAmount) || 0).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Category</label>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input"
                >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            {filteredExpenses.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg font-semibold">No expenses found</p>
                    <p className="text-gray-400 text-sm mt-2">Start adding expenses to see them here</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="gradient-bg text-white">
                                <th className="px-6 py-3 text-left font-semibold">Title</th>
                                <th className="px-6 py-3 text-left font-semibold">Amount</th>
                                <th className="px-6 py-3 text-left font-semibold">Category</th>
                                <th className="px-6 py-3 text-left font-semibold">Date</th>
                                <th className="px-6 py-3 text-center font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredExpenses.map((exp) => (
                                <tr key={exp.id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{exp.title}</td>
                                    <td className="px-6 py-4 font-bold text-indigo-600">₹{(Number(exp.amount) || 0).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className="badge-success inline-block">
                                            {exp.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">{exp.date}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => deleteExpense(exp.id)}
                                            disabled={isDeleting === exp.id}
                                            className="btn-danger px-4 py-2 text-sm font-semibold disabled:opacity-50"
                                        >
                                            {isDeleting === exp.id ? "Deleting..." : "🗑️ Delete"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}