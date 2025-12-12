"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";

export default function History() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("stt_token");
        if (!token) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/convert/history`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setHistory(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <Navbar />
            <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl border border-gray-200">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Conversion History</h1>
                {history.length === 0 ? (
                    <p className="text-gray-500 text-center">No history found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Transcript</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">Download</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {history.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">{item.filename}</td>
                                        <td className="px-6 py-4 whitespace-pre-wrap max-w-xs">{item.transcript}</td>
                                        <td className="px-6 py-4 text-center">
                                            <a href={`/api/convert/download/${item.id}`} className="text-blue-600 hover:text-blue-800 font-medium">Download</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
