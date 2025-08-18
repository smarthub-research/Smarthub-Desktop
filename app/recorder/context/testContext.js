"use client"
import {createContext, useContext, useEffect, useState} from 'react';

const TestContext = createContext();

export function TestProvider({ children }) {
    const [testData, setTestData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [testName, setTestName] = useState('');
    const [testDistance, setTestDistance] = useState('');
    const [unitType, setUnitType] = useState('m');
    const [comments, setComments] = useState('');
    const [formErrors, setFormErrors] = useState({
        testName: false
    });

    async function fetchReviewData() {
        if (window.electronAPI) {
            try {
                await window.electronAPI.setReviewData(testData);
                return await window.electronAPI.getReviewData();
            } catch (error) {
                console.error('Error fetching review data:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const fetchTestData = async () => {
            if (window.electronAPI) {
                try {
                    const response = await window.electronAPI.getTestData();
                    setTestData(response);
                } catch (error) {
                    console.error('Error fetching test data:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        fetchTestData();
    }, []);

    return (
        <TestContext.Provider value={{
            testData, testName, setTestName, testDistance, setTestDistance,
            unitType, setUnitType, comments, setComments, formErrors, setFormErrors,
            isLoading, fetchReviewData
        }}>
            {children}
        </TestContext.Provider>
    );
}

export const useTest = () => useContext(TestContext);
