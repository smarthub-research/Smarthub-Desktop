const { supabase } = require('../services/client');

async function submitTestData(metadata, rawDataBuffer) {
    try {
        const testJson = getTestJSON(rawDataBuffer);
        const { data, error } = await supabase
            .from('Test Files')
            .insert([
                {
                    distance: metadata.distance || null,
                    comments: metadata.comments || null,
                    flags: metadata.flags || null,
                    timeStamp: testJson.timeStamp,
                    displacement: testJson.displacement,
                    velocity: testJson.velocity,
                    heading: testJson.heading,
                    trajectory_x: testJson.trajectory_x,
                    trajectory_y: testJson.trajectory_y,
                    test_name: metadata.testName || "test_data",
                }
            ]).select();

        if (error) {
            console.error('Supabase error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data };
    } catch (err) {
        console.error('Exception in submitTestData:', err);
        return { success: false, error: err.message };
    }
}

function getTestJSON(rawDataBuffer) {
    const timeStamp = [];
    const displacement = [];
    const velocity = [];
    const heading = [];
    const trajectory_x = [];
    const trajectory_y = [];

    rawDataBuffer.map((row) => {
        timeStamp.push(row.timeStamp);
        displacement.push(row.displacement);
        velocity.push(row.velocity);
        heading.push(row.heading);
        trajectory_x.push(row.trajectory.x);
        trajectory_y.push(row.trajectory.y);
    });

    return { timeStamp, displacement, velocity, heading, trajectory_x, trajectory_y };
}

module.exports = {
    submitTestData
};