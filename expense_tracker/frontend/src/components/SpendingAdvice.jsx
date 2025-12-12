import { useEffect, useState } from "react";
import axios from "axios";

export default function SpendingAdvice({ user_id, dateFilter }) {
    const [advice, setAdvice] = useState("");
    const [categoryData, setCategoryData] = useState({});
    const [isWarning, setIsWarning] = useState(false);

    useEffect(() => {
        let url = `http://localhost:5000/api/expenses/${user_id}`;

        if (dateFilter?.startDate && dateFilter?.endDate) {
            url += `?start_date=${dateFilter.startDate}&end_date=${dateFilter.endDate}`;
        }

        axios.get(url)
            .then((res) => {
                const categories = {};
                let totalSpending = 0;

                (res.data || []).forEach((exp) => {
                    const amt = Number(exp.amount) || 0;
                    const cat = exp.category || 'Uncategorized';
                    categories[cat] = (categories[cat] || 0) + amt;
                    totalSpending += amt;
                });

                setCategoryData(categories);

                // Generate advice based on spending patterns
                let adviceText = "";
                let highSpendingCategories = [];
                let isEmpty = totalSpending === 0;

                // Find high spending categories (>30% of total)
                Object.entries(categories).forEach(([category, amount]) => {
                    const amt = Number(amount) || 0;
                    const percentage = totalSpending ? (amt / totalSpending) * 100 : 0;
                    if (percentage > 30) {
                        highSpendingCategories.push({ category, amount: amt, percentage });
                    }
                });

                if (isEmpty) {
                    adviceText = "No expenses recorded yet. Start adding expenses to get insights!";
                    setIsWarning(false);
                } else if (highSpendingCategories.length > 0) {
                    adviceText = "⚠️ High Spending Alert!\n\n";
                    highSpendingCategories.forEach(({ category, amount, percentage }) => {
                        adviceText += `• ${category}: ₹${amount.toFixed(2)} (${percentage.toFixed(1)}%)\n`;
                    });
                    adviceText += "\n💡 Recommendations:\n";
                    highSpendingCategories.forEach(({ category }) => {
                        adviceText += `• Consider reducing spending on "${category}"\n`;
                    });
                    adviceText += "\nSet category budgets and track them weekly!";
                    setIsWarning(true);
                } else {
                    adviceText = "✅ Excellent! Your spending is well-balanced.\n\nYour expenses are distributed evenly across categories. Keep maintaining this healthy spending pattern!";
                    setIsWarning(false);
                }

                setAdvice(adviceText);
            })
            .catch((err) => console.error("Error fetching expenses:", err));
    }, [user_id, dateFilter]);

    return (
        <div className={`card ${isWarning ? 'bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'}`}>
            <h2 className={`title ${isWarning ? 'text-red-600' : 'text-green-600'}`}>
                {isWarning ? "🚨 Spending Alert" : "📈 Spending Insights"}
            </h2>
            <p className={`whitespace-pre-line text-sm font-medium leading-relaxed ${isWarning ? 'text-red-800' : 'text-green-800'}`}>
                {advice}
            </p>
        </div>
    );
}
