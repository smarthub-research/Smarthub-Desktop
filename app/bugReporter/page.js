"use client"

import React, { useState } from "react";
import Link from "next/link";

export default function BugReporter() {
    const [bug, setBug] = useState({
        title: "",
        description: "",
        stepsToReproduce: "",
        expectedBehavior: "",
        actualBehavior: "",
        deviceInfo: "",
        email: ""
    });

    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBug(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (!bug.title.trim()) errors.title = "Bug title is required";
        if (!bug.description.trim()) errors.description = "Bug description is required";
        if (!bug.email.trim()) errors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(bug.email)) errors.email = "Email is invalid";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setIsSubmitted(true);
            setBug({
                title: "",
                description: "",
                stepsToReproduce: "",
                expectedBehavior: "",
                actualBehavior: "",
                deviceInfo: "",
                email: ""
            });
        } catch (error) {
            console.error("Failed to submit bug report:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grow min-h-screen overflow-x-hidden">
            <div className="container flex flex-col mx-auto max-h-screen px-4 justify-center">
                <h1 className="text-3xl md:text-4xl font-bold tracking-wider mb-8 text-center">
                    BUG REPORTER
                </h1>

                {isSubmitted ? (
                    <div className="bg-[#1a1a1a] rounded-lg shadow-lg p-8 max-w-2xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900 mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold mb-4 text-green-400">Bug Report Submitted</h2>
                        <p className="text-gray-300 mb-6">
                            Thank you for helping us improve our application. Your report has been received and we'll look into it promptly.
                        </p>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="bg-[#333333] hover:bg-[#444444] text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                        >
                            Submit Another Report
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
                        <div className="bg-[#1a1a1a] rounded-lg shadow-lg p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-300">
                                            Bug Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={bug.title}
                                            onChange={handleChange}
                                            placeholder="Concise title describing the issue"
                                            className={`w-full bg-[#252525] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 ${
                                                formErrors.title ? 'ring-red-500' : 'focus:ring-red-500'
                                            }`}
                                        />
                                        {formErrors.title && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formErrors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-300">
                                            Bug Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="description"
                                            value={bug.description}
                                            onChange={handleChange}
                                            placeholder="Detailed description of the bug"
                                            rows={4}
                                            className={`w-full bg-[#252525] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 ${
                                                formErrors.description ? 'ring-red-500' : 'focus:ring-red-500'
                                            }`}
                                        />
                                        {formErrors.description && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formErrors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-300">
                                            Steps to Reproduce
                                        </label>
                                        <textarea
                                            name="stepsToReproduce"
                                            value={bug.stepsToReproduce}
                                            onChange={handleChange}
                                            placeholder="1. Go to...\n2. Click on...\n3. Observe..."
                                            rows={3}
                                            className="w-full bg-[#252525] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-300">
                                                Expected Behavior
                                            </label>
                                            <textarea
                                                name="expectedBehavior"
                                                value={bug.expectedBehavior}
                                                onChange={handleChange}
                                                placeholder="What should have happened"
                                                rows={2}
                                                className="w-full bg-[#252525] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-300">
                                                Actual Behavior
                                            </label>
                                            <textarea
                                                name="actualBehavior"
                                                value={bug.actualBehavior}
                                                onChange={handleChange}
                                                placeholder="What actually happened"
                                                rows={2}
                                                className="w-full bg-[#252525] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-300">
                                            Device & Environment Info
                                        </label>
                                        <input
                                            type="text"
                                            name="deviceInfo"
                                            value={bug.deviceInfo}
                                            onChange={handleChange}
                                            placeholder="Browser, OS, device, app version, etc."
                                            className="w-full bg-[#252525] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-300">
                                            Contact Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={bug.email}
                                            onChange={handleChange}
                                            placeholder="Your email for follow-up questions"
                                            className={`w-full bg-[#252525] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 ${
                                                formErrors.email ? 'ring-red-500' : 'focus:ring-red-500'
                                            }`}
                                        />
                                        {formErrors.email && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formErrors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition duration-200 ${
                                                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}