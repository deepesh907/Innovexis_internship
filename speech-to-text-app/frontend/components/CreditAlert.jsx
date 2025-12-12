// components/CreditAlert.jsx
'use client';

import { useEffect, useState } from 'react';

export default function CreditAlert() {
    const [alert, setAlert] = useState(null);
    const [apiStatus, setApiStatus] = useState(null);

    useEffect(() => {
        // Check for stored alerts
        const storedAlert = localStorage.getItem('credit_alert');
        if (storedAlert) {
            setAlert(JSON.parse(storedAlert));
        }

        // Listen for new credit warnings
        const handleCreditWarning = (event) => {
            setAlert(event.detail);
        };

        window.addEventListener('credit-warning', handleCreditWarning);

        // Check API status on load
        checkApiStatus();

        return () => {
            window.removeEventListener('credit-warning', handleCreditWarning);
        };
    }, []);

    const checkApiStatus = async () => {
        try {
            const status = await fetch('/api/transcribe').then(res => res.json());
            setApiStatus(status);

            // If credits are exhausted, show alert
            if (status.openai?.credits === 'exhausted') {
                setAlert({
                    type: 'warning',
                    title: 'API Credits Exhausted',
                    message: 'Your OpenAI credits have been exhausted.',
                    action: 'Please recharge your account for real transcriptions.',
                    billingUrl: 'https://platform.openai.com/account/billing'
                });
            }
        } catch (error) {
            console.error('Error checking API status:', error);
        }
    };

    const closeAlert = () => {
        setAlert(null);
        localStorage.removeItem('credit_alert');
    };

    if (!alert) return null;

    return (
        <div className="fixed bottom-4 right-4 max-w-md bg-yellow-50 border-l-4 border-yellow-400 p-4 shadow-lg rounded-lg z-50">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                        {alert.title}
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                        <p>{alert.message}</p>
                        <p className="mt-1 font-semibold">{alert.action}</p>
                        {alert.billingUrl && (
                            <a
                                href={alert.billingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                                Go to Billing
                            </a>
                        )}
                    </div>
                </div>
                <div className="ml-auto pl-3">
                    <button
                        onClick={closeAlert}
                        className="inline-flex text-yellow-400 hover:text-yellow-500 focus:outline-none"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}