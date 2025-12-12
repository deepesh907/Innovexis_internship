import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Expense from "../components/Expense";
import AddExpense from "../components/AddExpense";
import Chart from "../components/Chart";
import PieChart from "../components/PieChart";
import LineChart from "../components/LineChart";
import SpendingAdvice from "../components/SpendingAdvice";
import FilterExpenses from "../components/FilterExpenses";

export default function Dashboard({ user_id, onLogout }) {
    const navigate = useNavigate();

    const [refresh, setRefresh] = useState(0);
    const [dateFilter, setDateFilter] = useState({ startDate: null, endDate: null });

    const handleExpenseDeleted = () => {
        setRefresh(refresh + 1);
    };

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header Section */}
            <div className="gradient-bg bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 px-6 shadow-lg">
                <div className="container-premium">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="heading-1 text-white mb-2">💰 Smart Expense Tracker</h1>
                            <p className="text-indigo-100 text-lg">Track, Analyze, and Optimize Your Spending</p>
                        </div>
                        <div className="text-right">
                            <p className="text-indigo-100 mb-3">User ID: <span className="font-bold text-white">{user_id}</span></p>
                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary px-4 py-2 text-sm"
                            >
                                🚪 Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-premium">
                {/* Add Expense Section */}
                <section className="mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Add Expense Form */}
                        <div className="lg:col-span-1 animate-slide-in">
                            <AddExpense user_id={user_id} onExpenseAdded={() => setRefresh(refresh + 1)} />
                        </div>

                        {/* Spending Advice */}
                        <div className="lg:col-span-2 animate-slide-in">
                            <SpendingAdvice user_id={user_id} dateFilter={dateFilter} />
                        </div>
                    </div>
                </section>

                {/* Filter Section */}
                <section className="mb-12 animate-slide-in">
                    <FilterExpenses onFilterChange={setDateFilter} />
                </section>

                {/* Charts Section */}
                <section className="mb-12">
                    <h2 className="heading-2 text-white mb-8 text-center">Financial Analytics</h2>

                    {/* Row 1: Bar and Pie Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="animate-slide-in" >
                            <Chart user_id={user_id} refresh={refresh} dateFilter={dateFilter} />
                        </div>
                        <div className="animate-slide-in">
                            <PieChart user_id={user_id} refresh={refresh} dateFilter={dateFilter} />
                        </div>
                    </div>

                    {/* Row 2: Line Chart */}
                    <div className="animate-slide-in">
                        <LineChart user_id={user_id} refresh={refresh} dateFilter={dateFilter} />
                    </div>
                </section>

                {/* Expense List Section */}
                <section className="animate-slide-in mb-12">
                    <Expense user_id={user_id} refresh={refresh} dateFilter={dateFilter} onExpenseDeleted={handleExpenseDeleted} />
                </section>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 text-center mt-12">
                <p className="text-indigo-100">&copy; 2024 Smart Expense Tracker</p>
            </div>
        </div>
    );
}
