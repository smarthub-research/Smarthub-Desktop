'use client'
import React, { useState } from "react";

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
        <div className="flex min-h-screen items-center justify-center grow">
            <div className="w-full max-w-xl mx-auto p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center tracking-tight">
                    Bug Reporter
                </h1>
                <div className="bg-white rounded-xl shadow-md p-8">
                    {isSubmitted ? (
                        <div className="flex flex-col items-center">
                            <div className="bg-green-100 rounded-full p-4 mb-4">
                                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-green-700 mb-2">Report Submitted</h2>
                            <p className="text-gray-600 mb-4 text-center">
                                Thank you for your feedback! We’ll review your report soon.
                            </p>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
                            >
                                Submit Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bug Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={bug.title}
                                    onChange={handleChange}
                                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                                        formErrors.title ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
                                    }`}
                                    placeholder="Short summary"
                                />
                                {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={bug.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                                        formErrors.description ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
                                    }`}
                                    placeholder="Describe the issue"
                                />
                                {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Steps to Reproduce
                                </label>
                                <textarea
                                    name="stepsToReproduce"
                                    value={bug.stepsToReproduce}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="1. Go to...\n2. Click on...\n3. Observe..."
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Expected Behavior
                                    </label>
                                    <textarea
                                        name="expectedBehavior"
                                        value={bug.expectedBehavior}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="What should happen"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Actual Behavior
                                    </label>
                                    <textarea
                                        name="actualBehavior"
                                        value={bug.actualBehavior}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="What actually happened"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Device & Environment
                                </label>
                                <input
                                    type="text"
                                    name="deviceInfo"
                                    value={bug.deviceInfo}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Browser, OS, device, etc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={bug.email}
                                    onChange={handleChange}
                                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                                        formErrors.email ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
                                    }`}
                                    placeholder="you@example.com"
                                />
                                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition ${
                                        isSubmitting ? "opacity-60 cursor-not-allowed" : ""
                                    }`}
                                >
                                    {isSubmitting ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}