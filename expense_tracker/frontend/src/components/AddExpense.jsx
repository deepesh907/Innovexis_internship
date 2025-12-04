import { useState } from "react";
import axios from "axios";

export default function AddExpense({ user_id, onExpenseAdded }) {

    const [form, setForm] = useState({
        title: "",
        amount: "",
        category: "",
        date: ""
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // handle input change
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // submit expense
    const submitExpense = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        // Client-side validation
        if (!form.title || !form.amount || !form.category || !form.date) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        const expenseData = {
            ...form,
            user_id: user_id,
            amount: parseFloat(form.amount)
        };

        try {
            const res = await axios.post(
                "http://localhost:5000/api/expense/add",
                expenseData
            );

            setError("");
            setSuccess("✅ Expense added successfully!");

            // reset form after submit
            setForm({
                title: "",
                amount: "",
                category: "",
                date: ""
            });

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(""), 3000);

            // Trigger chart refresh
            if (onExpenseAdded) {
                onExpenseAdded();
            }

        } catch (err) {
            const serverMsg = err?.response?.data?.error || "Error adding expense. Please try again.";
            setError(serverMsg);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card bg-white/95 backdrop-blur-xl border border-white/20">
            <h2 className="title">➕ Add New Expense</h2>

            {error && (
                <div className="alert alert-warning mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success mb-4">
                    {success}
                </div>
            )}

            <form onSubmit={submitExpense} className="space-y-4">

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="input"
                        placeholder="e.g., Grocery shopping"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                    <input
                        type="number"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        className="input"
                        placeholder="0.00"
                        step="0.01"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="input"
                        required
                        disabled={isLoading}
                    >
                        <option value="">Select a category</option>
                        <option value="Food & Dining">🍕 Food & Dining</option>
                        <option value="Transportation">🚗 Transportation</option>
                        <option value="Entertainment">🎮 Entertainment</option>
                        <option value="Shopping">🛍️ Shopping</option>
                        <option value="Utilities">💡 Utilities</option>
                        <option value="Healthcare">🏥 Healthcare</option>
                        <option value="Education">📚 Education</option>
                        <option value="Other">📌 Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        className="input"
                        required
                        disabled={isLoading}
                    />
                </div>

                <button type="submit" className="btn btn-primary w-full font-semibold text-white" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Expense"}
                </button>

            </form>
        </div>
    );
}
