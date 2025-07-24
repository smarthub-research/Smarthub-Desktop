'use client';

import {useState, useRef, useEffect, use} from "react";
import {BsFillSendFill, BsGraphUp, BsX} from "react-icons/bs";
import useFetchFlags from "../hooks/useFetchFlags";
import { useFlagging } from "../context/flaggingContext";

// This component provides a console for users to add flags (annotations) to specific graphs
export default function FlagConsole({setFlagging}) {
    const [comment, setComment] = useState("");
    const [selectedGraph, setSelectedGraph] = useState(null);
    const [flags, setFlags] = useFetchFlags();
    const [isDragging, setIsDragging] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const dragHandleRef = useRef(null);
    const textareaRef = useRef(null);
    const { width, setWidth } = useFlagging();

    // Animation on mount
    useEffect(() => {
        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    // Graph options for selection
    const graphOptions = [
        { id: 1, name: "D vs T" },
        { id: 2, name: "H vs T" },
        { id: 3, name: "V vs T" },
        { id: 4, name: "Traj" },
        { id: 5, name: "General" },
    ];

    // Auto-resize textarea based on content
    useEffect(() => {
        if (textareaRef.current) {
            // Reset height to auto to get the correct scrollHeight
            textareaRef.current.style.height = 'auto';
            // Set new height based on scrollHeight (with min height of 40px)
            const newHeight = Math.max(40, textareaRef.current.scrollHeight);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [comment]);

    // Handle adding a flag
    function handleAddFlag() {
        if (!comment.trim() || !selectedGraph) return;
        // Create a new flag object
        const newFlag = {
            id: Date.now(),
            dateTime: new Date().toLocaleTimeString(),
            comment,
            graphId: selectedGraph
        };
        window.electronAPI.addFlag(newFlag);
        // Clear the input fields since flag was added
        setComment("");
        setSelectedGraph(null);
    }

    // Handle Enter key for adding flags
    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey && comment.trim() && selectedGraph) {
            e.preventDefault();
            handleAddFlag();
        }
    }

    // Resize handlers
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    // Handle mouse move and up events to resize the console
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;

            // Calculate new width based on mouse position
            const windowWidth = window.innerWidth;
            const mouseX = e.clientX;
            const newWidth = ((windowWidth - mouseX) / windowWidth) * 100;

            // Limit min and max width
            if (newWidth >= 15 && newWidth <= 50) {
                setWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            className="h-full border-l border-surface-200 flex flex-col bg-white text-black shadow-xl
            transition-all duration-500 ease-in-out grow shrink-0"
            style={{
                width: `${width}vw`,
                transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
                opacity: isVisible ? 1 : 0
            }}
        >
            {/* Resize handle */}
            <div
                ref={dragHandleRef}
                className={`absolute top-0 left-0 w-1 h-full cursor-ew-resize`}
                onMouseDown={handleMouseDown}
            />

            <div className="flex flex-row p-4 border-b border-gray-700 justify-between">
                <div className={"flex flex-col"}>
                    <h2 className="text-xl font-semibold mb-1">Flag Console</h2>
                    <p className="opacity-50 text-sm">Add notes to specific graphs</p>
                </div>
                <button onClick={setFlagging} className="opacity-50 hover:opacity-100 self-start scale-200">
                    <BsX />
                </button>
            </div>

            <div className="p-4 border-b border-gray-700">
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Select Graph
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {graphOptions.map(graph => (
                            <button
                                key={graph.id}
                                onClick={() => setSelectedGraph(graph.id)}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-gray-700 ${
                                    selectedGraph === graph.id
                                        ? 'bg-black text-white'
                                        : 'hover:bg-surface-200 hover:border-black'
                                }
                                ${graph.name === 'General' ? 'col-span-2' : ''}`}
                            >
                                {(graph.name !== 'General') && (<BsGraphUp />)}
                                <span>{graph.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-400 mb-1">
                        Comment
                    </label>
                    <div className="flex">
                        <div className="relative flex-grow">
                            <textarea
                                ref={textareaRef}
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter annotation..."
                                rows={1}
                                className="w-full border border-gray-700 rounded-l-lg py-2 px-3
                                          focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none overflow-hidden"
                                style={{ minHeight: '40px', maxHeight: '200px' }}
                            />
                        </div>
                        <button
                            onClick={handleAddFlag}
                            disabled={!comment.trim() || !selectedGraph}
                            className={`flex items-center justify-center bg-blue-600 text-white rounded-r-lg px-3 h-10 self-start ${
                                !comment.trim() || !selectedGraph ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'
                            }`}
                        >
                            <BsFillSendFill />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Press Shift+Enter for a new line</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <h3 className="text-sm uppercase text-gray-500 mb-2 font-medium">Recent Flags</h3>
                {flags.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center mt-4">
                        No flags added yet
                    </div>
                ) : (
                    <div className="space-y-3">
                        {flags.map(flag => (
                            <div key={flag.id} className="p-3 bg-surface-50 rounded-lg border border-gray-700">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold">
                                        {graphOptions.find(g => g.id === flag.graphId)?.name} Graph
                                    </span>
                                    <span className="text-xs text-gray-500">{flag.timestamp}</span>
                                </div>
                                <p className="text-sm whitespace-pre-line">{flag.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}