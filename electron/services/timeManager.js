// electron/services/timeManager.js
let recordingStartTime = null;
let pausedElapsedTime = 0;
let isRecordingState = false;
let isPausedState = false;

const timeManager = {
    getRecordingStartTime: () => recordingStartTime,
    setRecordingStartTime: (time) => recordingStartTime = time,
    getPausedElapsedTime: () => pausedElapsedTime,
    setPausedElapsedTime: (time) => pausedElapsedTime = time,
    isRecording: () => isRecordingState,
    setIsRecording: (state) => isRecordingState = state,
    isPaused: () => isPausedState,
    setIsPaused: (state) => isPausedState = state,
    reset: () => {
        recordingStartTime = null;
        pausedElapsedTime = 0;
        isRecordingState = false;
        isPausedState = false;
    }
};

module.exports = timeManager;