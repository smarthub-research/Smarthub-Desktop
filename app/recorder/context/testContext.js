"use client"
import {createContext, useCallback, useContext, useEffect, useState} from 'react';

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
    const [processedPackets, setProcessedPackets] = useState({
        distance: [],
        velocity: [],
        heading: [],
        trajectory: []
    });

    // Updates the previous data with the new processed packet
    const addProcessedData = (data) => {
        setProcessedPackets((prevData) => ({
            distance: [...prevData.distance, ...data.distance],
            velocity: [...prevData.velocity, ...data.velocity],
            heading: [...prevData.heading, ...data.heading],
            trajectory: [...prevData.trajectory, ...data.trajectory]
        }));
    };

    const clearProcessedData = () => {
        setProcessedPackets({
            distance: [],
            velocity: [],
            heading: [],
            trajectory: []
        });
    };

    const fetchReviewData = useCallback(async () => {
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
    }, [testData]);

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
            isLoading, fetchReviewData, processedPackets, addProcessedData, clearProcessedData
        }}>
            {children}
        </TestContext.Provider>
    );
}

export const useTest = () => useContext(TestContext);
