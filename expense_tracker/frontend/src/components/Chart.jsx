import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";
import axios from "axios";
import { useEffect, useState } from "react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Chart({ user_id, refresh, dateFilter }) {

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: "Expenses",
                data: [],
            }
        ]
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let url = `http://localhost:5000/api/expenses/${user_id}`;

        // Add date filter to query params if provided
        if (dateFilter?.startDate && dateFilter?.endDate) {
            url += `?start_date=${dateFilter.startDate}&end_date=${dateFilter.endDate}`;
        }

        setLoading(true);
        setError(null);

        axios.get(url)
            .then((res) => {

                const categories = {};
                (res.data || []).forEach((exp) => {
                    const amt = Number(exp.amount) || 0;
                    const cat = exp.category || "Uncategorized";
                    categories[cat] = (categories[cat] || 0) + amt;
                });

                setChartData({
                    labels: Object.keys(categories),
                    datasets: [
                        {
                            label: "Expenses",
                            data: Object.values(categories),
                            backgroundColor: "rgba(59, 130, 246, 0.7)",
                            borderColor: "rgba(59, 130, 246, 1)",
                            borderWidth: 1
                        }
                    ]
                });
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching expenses:", err);
                setError(err?.response?.data?.error || "Failed to load chart");
                setLoading(false);
            });
    }, [user_id, refresh, dateFilter]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' }
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    return (
        <div className="card w-full h-64">
            {error && (
                <div className="alert alert-warning mb-4">
                    ⚠️ {error}
                </div>
            )}
            {loading && (
                <div className="text-center py-8">
                    <p className="text-gray-500">Loading chart...</p>
                </div>
            )}
            {!loading && !error && (
                <div className="w-full h-48">
                    <Bar data={chartData} options={chartOptions} />
                </div>
            )}
        </div>
    );
}
