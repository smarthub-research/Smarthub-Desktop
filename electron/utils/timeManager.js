/**
 * Simple time-tracking helper used by the recording UI.
 *
 * Tracks:
 * - `recordingStartTime`: epoch ms when the current recording began (or resumed)
 * - `pausedElapsedTime`: milliseconds elapsed while paused (used when resuming)
 * - `isRecordingState` / `isPausedState`: boolean flags used by UI logic
 *
 * Semantics:
 * - `beginRecording()` starts or resumes recording. If resuming, the
 *   `recordingStartTime` is set to now minus previously paused elapsed time
 *   so that elapsed time calculations remain continuous.
 * - `stopRecording()` transitions into paused state and snapshots how long
 *   was recorded so far into `pausedElapsedTime`.
 */

class TimeManager {
    constructor() {
        this.recordingStartTime = null;
        this.pausedElapsedTime = 0; // milliseconds accumulated while paused
        this.isRecordingState = false;
        this.isPausedState = false;
    }

    getRecordingStartTime() { return this.recordingStartTime; }
    setRecordingStartTime(time) { this.recordingStartTime = time; }

    getPausedElapsedTime() { return this.pausedElapsedTime; }
    setPausedElapsedTime(time) { this.pausedElapsedTime = time; }

    isRecording() { return this.isRecordingState; }
    setIsRecording(state) { this.isRecordingState = state; }

    isPaused() { return this.isPausedState; }
    setIsPaused(state) { this.isPausedState = state; }

    // Reset all tracking values (clear recording state)
    reset() {
        this.recordingStartTime = null;
        this.pausedElapsedTime = 0;
        this.isRecordingState = false;
        this.isPausedState = false;
    }

    // Begin or resume recording. Preserves elapsed time when resuming.
    beginRecording() {
        if (this.isPaused()) {
            // Resume: preserve elapsed time accumulated before pause
            this.setIsPaused(false);
            this.setRecordingStartTime(Date.now() - this.getPausedElapsedTime());
        } else {
            // Fresh start
            this.setRecordingStartTime(Date.now());
            this.setPausedElapsedTime(0);
        }
        this.setIsRecording(true);
    }

    // Stop/pause recording: calculate total elapsed time up to stop moment
    stopRecording() {
        this.setIsRecording(false);
        this.setIsPaused(true);
        if (this.getRecordingStartTime()) {
            this.setPausedElapsedTime(Date.now() - this.getRecordingStartTime());
        }
    }

    // Restart recording timer; if currently recording, sets new start time.
    restartRecording() {
        this.setRecordingStartTime(this.isRecording() ? Date.now() : null);
        this.setPausedElapsedTime(0);
        this.setIsPaused(false);
    }
}

module.exports = new TimeManager();