// Constants for downsampling
const TARGET_POINTS = 10; // Target number of points to downsample
const DOWNSAMPLE_TO = 3;  // Target number after downsampling

// Constants for calculations
const IN_TO_M = 0.0254;
const WHEEL_DIAM_IN = 24;
const WHEEL_RADIUS_M = (WHEEL_DIAM_IN / 2) * IN_TO_M; // Convert to meters
const DIST_WHEELS_IN = 26;
const DIST_WHEELS_M = DIST_WHEELS_IN * IN_TO_M; // Convert to meters
const DT = 0.058;

module.exports = {
    TARGET_POINTS,
    DOWNSAMPLE_TO,
    IN_TO_M,
    WHEEL_DIAM_IN,
    WHEEL_RADIUS_M,
    DIST_WHEELS_IN,
    DIST_WHEELS_M,
    DT
};