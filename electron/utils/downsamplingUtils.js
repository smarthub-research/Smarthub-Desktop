/**
 * Downsample data using Largest Triangle Three Buckets (LTTB) algorithm.
 *
 * This utility accepts a buffer object with parallel arrays (timeStamp,
 * displacement, gyroLeft, etc.) and returns a reduced array of samples
 * preserving the overall shape of the displacement/time series. The
 * implementation uses timestamps and displacement to compute triangle
 * areas — other metrics are carried along from the chosen indices.
 *
 * Edge cases:
 * - If `dataLength <= targetPoints`, the function returns all points in
 *   a normalized array form instead of downsampling.
 * - If `targetPoints === 3`, a small optimized path selects the first,
 *   middle (max-area) and last points.
 *
 * @param {Object} buffer - Buffer containing arrays of data values
 * @param {number} targetPoints - Target number of points after downsampling
 * @returns {Array} - Array of downsampled data points (objects with metrics)
 */
function downsampleData(buffer, targetPoints) {
    const dataLength = buffer.timeStamp.length;
    if (dataLength <= targetPoints) {
        // Not enough data to downsample, return data as is but in proper format
        const result = [];
        for (let i = 0; i < dataLength; i++) {
            result.push({
                gyroLeft: buffer.gyroLeft[i],
                gyroRight: buffer.gyroRight[i],
                accelLeft: buffer.accelLeft[i],
                accelRight: buffer.accelRight[i],
                displacement: buffer.displacement[i],
                velocity: buffer.velocity[i],
                heading: buffer.heading[i],
                trajectory_x: buffer.trajectory_x[i],
                trajectory_y: buffer.trajectory_y[i],
                timeStamp: buffer.timeStamp[i]
            });
        }
        return result;
    }

    // When specifically downsampling to 3 points: choose first, best middle, last
    if (targetPoints === 3) {
        // First point is always included
        const result = [{
            gyroLeft: buffer.gyroLeft[0],
            gyroRight: buffer.gyroRight[0],
            accelLeft: buffer.accelLeft[0],
            accelRight: buffer.accelRight[0],
            displacement: buffer.displacement[0],
            velocity: buffer.velocity[0],
            heading: buffer.heading[0],
            trajectory_x: buffer.trajectory_x[0],
            trajectory_y: buffer.trajectory_y[0],
            timeStamp: buffer.timeStamp[0]
        }];

        // Find the point in the middle that creates the largest triangle with
        // the first and last points using displacement vs time as X/Y.
        const firstTimeStamp = buffer.timeStamp[0];
        const lastTimeStamp = buffer.timeStamp[dataLength - 1];
        const firstDisplacement = buffer.displacement[0];
        const lastDisplacement = buffer.displacement[dataLength - 1];

        let maxArea = -1;
        let maxAreaIndex = 1;

        // Check all points between first and last to find the max-area index.
        for (let i = 1; i < dataLength - 1; i++) {
            const currentTimeStamp = buffer.timeStamp[i];
            const currentDisplacement = buffer.displacement[i];

            // Calculate triangle area using cross product
            const area = Math.abs(
                (firstTimeStamp - lastTimeStamp) *
                (currentDisplacement - firstDisplacement) -
                (firstTimeStamp - currentTimeStamp) *
                (lastDisplacement - firstDisplacement)
            );

            if (area > maxArea) {
                maxArea = area;
                maxAreaIndex = i;
            }
        }

        // Add the point that creates largest triangle (preserve all metrics)
        result.push({
            gyroLeft: buffer.gyroLeft[maxAreaIndex],
            gyroRight: buffer.gyroRight[maxAreaIndex],
            accelLeft: buffer.accelLeft[maxAreaIndex],
            accelRight: buffer.accelRight[maxAreaIndex],
            displacement: buffer.displacement[maxAreaIndex],
            velocity: buffer.velocity[maxAreaIndex],
            heading: buffer.heading[maxAreaIndex],
            trajectory_x: buffer.trajectory_x[maxAreaIndex],
            trajectory_y: buffer.trajectory_y[maxAreaIndex],
            timeStamp: buffer.timeStamp[maxAreaIndex]
        });

        // Add the last point to close the sampled series
        result.push({
            gyroLeft: buffer.gyroLeft[dataLength - 1],
            gyroRight: buffer.gyroRight[dataLength - 1],
            accelLeft: buffer.accelLeft[dataLength - 1],
            accelRight: buffer.accelRight[dataLength - 1],
            displacement: buffer.displacement[dataLength - 1],
            velocity: buffer.velocity[dataLength - 1],
            heading: buffer.heading[dataLength - 1],
            trajectory_x: buffer.trajectory_x[dataLength - 1],
            trajectory_y: buffer.trajectory_y[dataLength - 1],
            timeStamp: buffer.timeStamp[dataLength - 1]
        });

        return result;
    }

    // For other target sizes, use the general LTTB algorithm. We create
    // equally-sized buckets between first and last, choose the max-area
    // point from each bucket, and include first/last.
    const sampled = [{
        gyroLeft: buffer.gyroLeft[0],
        gyroRight: buffer.gyroRight[0],
        accelLeft: buffer.accelLeft[0],
        accelRight: buffer.accelRight[0],
        displacement: buffer.displacement[0],
        velocity: buffer.velocity[0],
        heading: buffer.heading[0],
        trajectory_x: buffer.trajectory_x[0],
        trajectory_y: buffer.trajectory_y[0],
        timeStamp: buffer.timeStamp[0]
    }];

    const bucketSize = dataLength / (targetPoints - 2);

    for (let i = 0; i < targetPoints - 2; i++) {
        // Bucket range (inclusive start, exclusive end) — offset by 1 because
        // first element is already included in `sampled`.
        const startIdx = Math.floor((i) * bucketSize) + 1;
        const endIdx = Math.floor((i + 1) * bucketSize) + 1;
        const lastPoint = sampled[sampled.length - 1];
        const nextBucketIndex = Math.min(Math.floor((i + 2) * bucketSize) + 1, dataLength - 1);

        const nextPoint = {
            displacement: buffer.displacement[nextBucketIndex],
            timeStamp: buffer.timeStamp[nextBucketIndex]
        };

        const maxAreaIndex = getMaxAreaIndex(buffer, startIdx, endIdx, lastPoint, nextPoint);

        sampled.push({
            gyroLeft: buffer.gyroLeft[maxAreaIndex],
            gyroRight: buffer.gyroRight[maxAreaIndex],
            accelLeft: buffer.accelLeft[maxAreaIndex],
            accelRight: buffer.accelRight[maxAreaIndex],
            displacement: buffer.displacement[maxAreaIndex],
            velocity: buffer.velocity[maxAreaIndex],
            heading: buffer.heading[maxAreaIndex],
            trajectory_x: buffer.trajectory_x[maxAreaIndex],
            trajectory_y: buffer.trajectory_y[maxAreaIndex],
            timeStamp: buffer.timeStamp[maxAreaIndex]
        });
    }

    // Always include last point when more than one sample exists
    if (dataLength > 1) {
        sampled.push({
            gyroLeft: buffer.gyroLeft[dataLength - 1],
            gyroRight: buffer.gyroRight[dataLength - 1],
            accelLeft: buffer.accelLeft[dataLength - 1],
            accelRight: buffer.accelRight[dataLength - 1],
            displacement: buffer.displacement[dataLength - 1],
            velocity: buffer.velocity[dataLength - 1],
            heading: buffer.heading[dataLength - 1],
            trajectory_x: buffer.trajectory_x[dataLength - 1],
            trajectory_y: buffer.trajectory_y[dataLength - 1],
            timeStamp: buffer.timeStamp[dataLength - 1]
        });
    }

    return sampled;
}

/**
 * Find index within [startIdx, endIdx) that maximizes the triangle area
 * formed by lastPoint, candidate point and nextPoint. Area is computed
 * using cross-product (timeStamp as X, displacement as Y).
 */
function getMaxAreaIndex(buffer, startIdx, endIdx, lastPoint, nextPoint) {
    let maxArea = -1;
    let maxAreaIndex = startIdx;

    for (let j = startIdx; j < endIdx; j++) {
        // Calculate triangle area using cross product (signed area magnitude)
        const currentTimeStamp = buffer.timeStamp[j];
        const currentDisplacement = buffer.displacement[j];

        const area = Math.abs(
            (lastPoint.timeStamp - nextPoint.timeStamp) *
            (currentDisplacement - lastPoint.displacement) -
            (lastPoint.timeStamp - currentTimeStamp) *
            (nextPoint.displacement - lastPoint.displacement)
        );

        if (area > maxArea) {
            maxArea = area;
            maxAreaIndex = j;
        }
    }

    return maxAreaIndex;
}

module.exports = {
    downsampleData,
};