import { useState } from "react";

export default function FilterExpenses({ onFilterChange }) {
    const [filterType, setFilterType] = useState("all");
    const [customDays, setCustomDays] = useState(30);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleFilterChange = (type) => {
        setFilterType(type);

        let startD = null;
        let endD = new Date().toISOString().split("T")[0];

        if (type === "7days") {
            startD = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        } else if (type === "15days") {
            startD = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        } else if (type === "30days") {
            startD = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        } else if (type === "custom") {
            startD = new Date(Date.now() - customDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        }

        onFilterChange({ startDate: startD, endDate: endD });
    };

    const handleCustomDaysChange = (e) => {
        const days = parseInt(e.target.value) || 30;
        setCustomDays(days);

        const startD = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const endD = new Date().toISOString().split("T")[0];

        onFilterChange({ startDate: startD, endDate: endD });
    };

    const handleDateRangeChange = () => {
        if (startDate && endDate) {
            onFilterChange({ startDate, endDate });
        }
    };

    const handleClear = () => {
        setFilterType("all");
        setStartDate("");
        setEndDate("");
        onFilterChange({ startDate: null, endDate: null });
    };

    return (
        <div className="card bg-white/95 backdrop-blur-xl border border-white/20">
            <h2 className="title">🔍 Filter Expenses</h2>

            {/* Quick Filter Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { type: "all", label: "All Time", icon: "📅" },
                    { type: "7days", label: "Last 7 Days", icon: "📆" },
                    { type: "15days", label: "Last 15 Days", icon: "📊" },
                    { type: "30days", label: "Last 30 Days", icon: "📈" }
                ].map(({ type, label, icon }) => (
                    <button
                        key={type}
                        onClick={() => handleFilterChange(type)}
                        className={`p-3 rounded-lg font-semibold transition duration-200 ${filterType === type
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                    >
                        {icon} {label}
                    </button>
                ))}
            </div>

            {/* Custom Days Filter */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Custom Period (Days)</label>
                <div className="flex gap-3">
                    <input
                        type="number"
                        value={customDays}
                        onChange={handleCustomDaysChange}
                        min="1"
                        max="365"
                        className="input flex-1"
                        placeholder="Enter number of days"
                    />
                    <span className="text-gray-600 text-sm font-semibold self-center">days ago</span>
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Specific Date Range</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="input col-span-1"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="input col-span-1"
                    />
                    <button
                        onClick={handleDateRangeChange}
                        className="btn btn-primary col-span-2 md:col-span-1 font-semibold text-white"
                    >
                        Apply
                    </button>
                </div>
            </div>

            {/* Clear Button */}
            <button
                onClick={handleClear}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white p-3 rounded-lg font-semibold hover:shadow-lg transition duration-200"
            >
                🔄 Clear All Filters
            </button>
        </div>
    );
}
