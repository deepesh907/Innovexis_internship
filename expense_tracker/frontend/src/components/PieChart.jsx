import { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ user_id, refresh, dateFilter }) {
    const [pieData, setPieData] = useState({
        labels: [],
        datasets: [
            {
                label: "Expenses by Category",
                data: [],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.7)",
                    "rgba(54, 162, 235, 0.7)",
                    "rgba(255, 206, 86, 0.7)",
                    "rgba(75, 192, 192, 0.7)",
                    "rgba(153, 102, 255, 0.7)",
                    "rgba(255, 159, 64, 0.7)",
                    "rgba(99, 255, 132, 0.7)",
                    "rgba(255, 99, 255, 0.7)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                    "rgba(99, 255, 132, 1)",
                    "rgba(255, 99, 255, 1)",
                ],
                borderWidth: 1,
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
                const categories = {};
                (res.data || []).forEach((exp) => {
                    const amt = Number(exp.amount) || 0;
                    const cat = exp.category || "Uncategorized";
                    categories[cat] = (categories[cat] || 0) + amt;
                });

                setPieData({
                    labels: Object.keys(categories),
                    datasets: [
                        {
                            label: "Expenses by Category",
                            data: Object.values(categories),
                            backgroundColor: [
                                "rgba(255, 99, 132, 0.7)",
                                "rgba(54, 162, 235, 0.7)",
                                "rgba(255, 206, 86, 0.7)",
                                "rgba(75, 192, 192, 0.7)",
                                "rgba(153, 102, 255, 0.7)",
                                "rgba(255, 159, 64, 0.7)",
                                "rgba(99, 255, 132, 0.7)",
                                "rgba(255, 99, 255, 0.7)",
                            ],
                            borderColor: [
                                "rgba(255, 99, 132, 1)",
                                "rgba(54, 162, 235, 1)",
                                "rgba(255, 206, 86, 1)",
                                "rgba(75, 192, 192, 1)",
                                "rgba(153, 102, 255, 1)",
                                "rgba(255, 159, 64, 1)",
                                "rgba(99, 255, 132, 1)",
                                "rgba(255, 99, 255, 1)",
                            ],
                            borderWidth: 1,
                        },
                    ],
                });
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching expenses:", err);
                setError(err?.response?.data?.error || "Failed to load pie chart");
                setLoading(false);
            });
    }, [user_id, refresh, dateFilter]);

    return (
        <div className="card max-w-md mx-auto">
            <h2 className="title">Expense Distribution by Category</h2>
            {error && (
                <div className="alert alert-warning mb-4">
                    ⚠️ {error}
                </div>
            )}
            {loading && (
                <div className="text-center py-8">
                    <p className="text-gray-500">Loading pie chart...</p>
                </div>
            )}
            {!loading && !error && (
                <div className="flex justify-center">
                    <div className="w-80 h-80">
                        <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </div>
            )}
        </div>
    );
}
