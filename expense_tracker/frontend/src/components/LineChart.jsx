import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";

import { Filler } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

export default function LineChart({ user_id, refresh, dateFilter }) {
    const [lineData, setLineData] = useState({
        labels: [],
        datasets: [
            {
                label: "Daily Spending",
                data: [],
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderWidth: 2,
                fill: true,
                tension: 0.4,
            },
        ],
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let url = `http://localhost:5000/api/expenses/${user_id}`;

        if (dateFilter?.startDate && dateFilter?.endDate) {
            url += `?start_date=${dateFilter.startDate}&end_date=${dateFilter.endDate}`;
        }

        setLoading(true);
        setError(null);

        axios.get(url)
            .then((res) => {
                // Group by date and sum amounts (coerce values)
                const dailySpending = {};
                (res.data || []).forEach((exp) => {
                    const amt = Number(exp.amount) || 0;
                    const d = exp.date || 'Unknown';
                    dailySpending[d] = (dailySpending[d] || 0) + amt;
                });

                // Sort by date
                const sortedDates = Object.keys(dailySpending).sort();
                const amounts = sortedDates.map((date) => Number(dailySpending[date]) || 0);

                setLineData({
                    labels: sortedDates,
                    datasets: [
                        {
                            label: "Daily Spending",
                            data: amounts,
                            borderColor: "rgba(75, 192, 192, 1)",
                            backgroundColor: "rgba(75, 192, 192, 0.2)",
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                        },
                    ],
                });
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching expenses:", err);
                setError(err?.response?.data?.error || "Failed to load line chart");
                setLoading(false);
            });
    }, [user_id, refresh, dateFilter]);

    return (
        <div className="card max-w-2xl mx-auto">
            <h2 className="title">Spending Trend</h2>
            {error && (
                <div className="alert alert-warning mb-4">
                    ⚠️ {error}
                </div>
            )}
            {loading && (
                <div className="text-center py-8">
                    <p className="text-gray-500">Loading line chart...</p>
                </div>
            )}
            {!loading && !error && (
                <Line
                    data={lineData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                display: true,
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                            },
                        },
                    }}
                />
            )}
        </div>
    );
}
