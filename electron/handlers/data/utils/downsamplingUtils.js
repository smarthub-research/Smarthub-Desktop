/**
 * Downsample data using Largest Triangle Three Buckets (LTTB) algorithm.
 * Works with a buffer object that has arrays of values.
 *
 * @param {Object} buffer - Buffer containing arrays of data values
 * @param {number} targetPoints - Target number of points after downsampling
 * @returns {Array} - Array of downsampled data points
 */
function downsampleData(buffer, targetPoints) {
    const dataLength = buffer.timeStamp.length;
    if (dataLength <= targetPoints) {
        // Not enough data to downsample, return data as is but in proper format
        const result = [];
        for (let i = 0; i < dataLength; i++) {
            result.push({
                gyro_left: buffer.gyro_left[i],
                gyro_right: buffer.gyro_right[i],
                accel_left: buffer.accel_left[i],
                accel_right: buffer.accel_right[i],
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

    // When specifically downsampling to 3 points:
    if (targetPoints === 3) {
        // First point is always included
        const result = [{
            gyro_left: buffer.gyro_left[0],
            gyro_right: buffer.gyro_right[0],
            accel_left: buffer.accel_left[0],
            accel_right: buffer.accel_right[0],
            displacement: buffer.displacement[0],
            velocity: buffer.velocity[0],
            heading: buffer.heading[0],
            trajectory_x: buffer.trajectory_x[0],
            trajectory_y: buffer.trajectory_y[0],
            timeStamp: buffer.timeStamp[0]
        }];

        // Find the point in the middle that creates the largest triangle with first and last points
        const firstTimeStamp = buffer.timeStamp[0];
        const lastTimeStamp = buffer.timeStamp[dataLength - 1];
        const firstDisplacement = buffer.displacement[0];
        const lastDisplacement = buffer.displacement[dataLength - 1];

        let maxArea = -1;
        let maxAreaIndex = 1;

        // Check all points between first and last
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

        // Add the point that creates largest triangle
        result.push({
            gyro_left: buffer.gyro_left[maxAreaIndex],
            gyro_right: buffer.gyro_right[maxAreaIndex],
            accel_left: buffer.accel_left[maxAreaIndex],
            accel_right: buffer.accel_right[maxAreaIndex],
            displacement: buffer.displacement[maxAreaIndex],
            velocity: buffer.velocity[maxAreaIndex],
            heading: buffer.heading[maxAreaIndex],
            trajectory_x: buffer.trajectory_x[maxAreaIndex],
            trajectory_y: buffer.trajectory_y[maxAreaIndex],
            timeStamp: buffer.timeStamp[maxAreaIndex]
        });

        // Add the last point
        result.push({
            gyro_left: buffer.gyro_left[dataLength - 1],
            gyro_right: buffer.gyro_right[dataLength - 1],
            accel_left: buffer.accel_left[dataLength - 1],
            accel_right: buffer.accel_right[dataLength - 1],
            displacement: buffer.displacement[dataLength - 1],
            velocity: buffer.velocity[dataLength - 1],
            heading: buffer.heading[dataLength - 1],
            trajectory_x: buffer.trajectory_x[dataLength - 1],
            trajectory_y: buffer.trajectory_y[dataLength - 1],
            timeStamp: buffer.timeStamp[dataLength - 1]
        });

        return result;
    }

    // For other target sizes, use the general LTTB algorithm
    const sampled = [{
        gyro_left: buffer.gyro_left[0],
        gyro_right: buffer.gyro_right[0],
        accel_left: buffer.accel_left[0],
        accel_right: buffer.accel_right[0],
        displacement: buffer.displacement[0],
        velocity: buffer.velocity[0],
        heading: buffer.heading[0],
        trajectory_x: buffer.trajectory_x[0],
        trajectory_y: buffer.trajectory_y[0],
        timeStamp: buffer.timeStamp[0]
    }];

    const bucketSize = dataLength / (targetPoints - 2);

    for (let i = 0; i < targetPoints - 2; i++) {
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
            gyro_left: buffer.gyro_left[maxAreaIndex],
            gyro_right: buffer.gyro_right[maxAreaIndex],
            accel_left: buffer.accel_left[maxAreaIndex],
            accel_right: buffer.accel_right[maxAreaIndex],
            displacement: buffer.displacement[maxAreaIndex],
            velocity: buffer.velocity[maxAreaIndex],
            heading: buffer.heading[maxAreaIndex],
            trajectory_x: buffer.trajectory_x[maxAreaIndex],
            trajectory_y: buffer.trajectory_y[maxAreaIndex],
            timeStamp: buffer.timeStamp[maxAreaIndex]
        });
    }

    if (dataLength > 1) {
        sampled.push({
            gyro_left: buffer.gyro_left[dataLength - 1],
            gyro_right: buffer.gyro_right[dataLength - 1],
            accel_left: buffer.accel_left[dataLength - 1],
            accel_right: buffer.accel_right[dataLength - 1],
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

function getMaxAreaIndex(buffer, startIdx, endIdx, lastPoint, nextPoint) {
    let maxArea = -1;
    let maxAreaIndex = startIdx;

    for (let j = startIdx; j < endIdx; j++) {
        // Calculate triangle area using cross product
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