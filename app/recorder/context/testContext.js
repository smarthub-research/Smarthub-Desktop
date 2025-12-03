"use client"
import {createContext, useCallback, useContext, useEffect, useState, useRef} from 'react';
import { ChartRingBufferManager } from '../utils/RingBuffer';

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
    
    // Ring buffer manager (persistent across renders)
    const ringBufferManager = useRef(new ChartRingBufferManager(1000));
    
    // State for chart display (triggers re-renders when updated)
    const [processedPackets, setProcessedPackets] = useState({
        distance: [],
        velocity: [],
        heading: [],
        trajectory: []
    });
    
    // Track recording state
    const [isRecording, setIsRecording] = useState(false);
    const [isStopped, setIsStopped] = useState(false);

    // Updates the ring buffer with new processed packet - O(1) operation
    const addProcessedData = (data) => {
        ringBufferManager.current.addData(data);
        
        // Update state to trigger re-render with current buffer data
        setProcessedPackets(ringBufferManager.current.getData());
    };

    const clearProcessedData = () => {
        ringBufferManager.current.clear();
        setProcessedPackets({
            distance: [],
            velocity: [],
            heading: [],
            trajectory: []
        });
        setIsRecording(false);
        setIsStopped(false);
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

    // Handle recording state changes
    const handleStartRecording = useCallback(() => {
        setIsRecording(true);
        setIsStopped(false);
    }, []);

    const handleStopRecording = useCallback(async () => {
        setIsRecording(false);
        setIsStopped(true);
        ringBufferManager.current.stopRecording();
        
        // Automatically fetch full data from backend when stopping
        if (window.electronAPI && window.electronAPI.getFullTestData) {
            try {
                console.log('Fetching full test data from backend...');
                const fullData = await window.electronAPI.getFullTestData();
                if (fullData && fullData.distance && fullData.distance.length > 0) {
                    console.log('Full data received:', {
                        distance: fullData.distance.length,
                        velocity: fullData.velocity.length,
                        heading: fullData.heading.length,
                        trajectory: fullData.trajectory.length
                    });
                    ringBufferManager.current.cacheFullData(fullData);
                    setProcessedPackets(fullData);
                } else {
                    console.log('No full data available, keeping ring buffer data');
                }
            } catch (error) {
                console.error('Error fetching full test data:', error);
            }
        }
    }, []);

    const handleRestartRecording = useCallback(() => {
        setIsRecording(true);
        setIsStopped(false);
        
        // Trim frontend ring buffers back to most recent points
        // This clears the frontend's full data cache but backend keeps everything
        ringBufferManager.current.restartRecording();
        
        // Update display to show trimmed data from ring buffer
        setProcessedPackets(ringBufferManager.current.getData());
    }, []);

    // Fetch full data from backend when stopped (called by charts)
    const fetchFullData = useCallback(async () => {
        if (!isStopped) return null;
        
        // Check if we already have cached full data
        const cachedData = ringBufferManager.current.getFullData();
        if (cachedData && cachedData.distance.length > ringBufferManager.current.capacity) {
            return cachedData;
        }
        
        // Request full data from backend/electron
        if (window.electronAPI && window.electronAPI.getFullTestData) {
            try {
                const fullData = await window.electronAPI.getFullTestData();
                if (fullData) {
                    ringBufferManager.current.cacheFullData(fullData);
                    setProcessedPackets(fullData);
                    return fullData;
                }
            } catch (error) {
                console.error('Error fetching full test data:', error);
            }
        }
        
        return null;
    }, [isStopped]);

    return (
        <TestContext.Provider value={{
            testData, testName, setTestName, testDistance, setTestDistance,
            unitType, setUnitType, comments, setComments, formErrors, setFormErrors,
            isLoading, fetchReviewData, processedPackets, addProcessedData, clearProcessedData,
            isRecording, isStopped, handleStartRecording, handleStopRecording, 
            handleRestartRecording, fetchFullData, ringBufferManager: ringBufferManager.current
        }}>
            {children}
        </TestContext.Provider>
    );
}

export const useTest = () => useContext(TestContext);
