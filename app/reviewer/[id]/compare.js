"use client"

import { useState, useEffect } from "react"

export default function Compare({ onComparisonSelect, currentTestId }) {
    const [selected, setSelected] = useState("")
    const [testFiles, setTestFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comparisonData, setComparisonData] = useState(null);
    const limit = 10;

    useEffect(() => {
        const fetchTestFiles = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/db/tests?page=1&limit=${limit}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                // Filter out the current test from the comparison list
                const filteredTests = (data.data || []).filter(test => test.id !== currentTestId);
                setTestFiles(filteredTests);
            } catch (error) {
                console.error('Error fetching test files:', error);
                setTestFiles([]);
            } finally {
                setLoading(false);
            }
        }
        fetchTestFiles()
    }, [currentTestId])

    // Fetch comparison test data when a test is selected
    useEffect(() => {
        const fetchComparisonData = async () => {
            if (!selected) {
                setComparisonData(null);
                onComparisonSelect(null);
                return;
            }

            try {
                const response = await fetch(`http://localhost:8000/db/tests/${selected}?response_format=review`, {
                    method: 'GET',
                });
                const data = await response.json();
                setComparisonData(data);
                onComparisonSelect(data);
            } catch (error) {
                console.error('Error fetching comparison test data:', error);
                setComparisonData(null);
                onComparisonSelect(null);
            }
        };

        fetchComparisonData();
    }, [selected, onComparisonSelect]);

    const handleChange = (e) => {
        setSelected(e.target.value)
    }

    const handleClear = () => {
        setSelected("");
    }

    return (
        <div className="flex flex-row gap-4 items-center w-full">
            <p className="text-sm font-medium">Compare with:</p>
            <select
                className="block w-full max-w-md appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-10 text-base text-foreground shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-card dark:text-card-foreground dark:border-border transition-colors duration-200"
                value={selected}
                onChange={handleChange}
                disabled={loading}
            >
                <option value="">Select a test to compare...</option>
                {testFiles.map((test, index) => (
                    <option className="bg-card text-foreground dark:bg-card dark:text-card-foreground" key={test.id} value={test.id}>
                        {test.test_name || `Test ${index + 1}`} - {test.created_at?.slice(0, 10)}
                    </option>
                ))}
            </select>
            {selected && (
                <button
                    onClick={handleClear}
                    className="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                >
                    Clear
                </button>
            )}
        </div>
    )
}