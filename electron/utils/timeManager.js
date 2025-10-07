class TimeManager {
    constructor() {
        this.recordingStartTime = null;
        this.pausedElapsedTime = 0;
        this.isRecordingState = false;
        this.isPausedState = false;
    }

    getRecordingStartTime() {
        return this.recordingStartTime;
    }

    setRecordingStartTime(time) {
        this.recordingStartTime = time;
    }

    getPausedElapsedTime() {
        return this.pausedElapsedTime;
    }

    setPausedElapsedTime(time) {
        this.pausedElapsedTime = time;
    }

    isRecording() {
        return this.isRecordingState;
    }

    setIsRecording(state) {
        this.isRecordingState = state;
    }

    isPaused() {
        return this.isPausedState;
    }

    setIsPaused(state) {
        this.isPausedState = state;
    }

    reset() {
        this.recordingStartTime = null;
        this.pausedElapsedTime = 0;
        this.isRecordingState = false;
        this.isPausedState = false;
    }

    beginRecording() {
        if (this.isPaused()) {
            this.setIsPaused(false);
            this.setRecordingStartTime(Date.now() - this.getPausedElapsedTime());
        } else {
            this.setRecordingStartTime(Date.now());
            this.setPausedElapsedTime(0);
        }
        this.setIsRecording(true);
    }

    stopRecording() {
        this.setIsRecording(false);
        this.setIsPaused(true);
        if (this.getRecordingStartTime()) {
            this.setPausedElapsedTime(Date.now() - this.getRecordingStartTime());
        }
    }

    restartRecording() {
        this.setRecordingStartTime(this.isRecording() ? Date.now() : null);
        this.setPausedElapsedTime(0);
        this.setIsPaused(false);
    }
}

module.exports = new TimeManager();