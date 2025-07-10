const { getSupabaseWithAuth } = require('../../../services/client');

async function submitTestData(metadata) {
    try {
        const supabase = await getSupabaseWithAuth();
        // Insert test file and get the inserted row's ID
        const testFileResult = await insertTestFile(metadata);
        if (!testFileResult.success) {
            throw new Error(testFileResult.error);
        }

        const testFileId = testFileResult.data[0].id; // Assuming the first inserted row is returned

        // Insert test info with the foreign key reference
        const testInfoResult = await insertTestInfo({ ...metadata, test_file_id: testFileId });
        if (!testInfoResult.success) {
            throw new Error(testInfoResult.error);
        }

        return { success: true };
    } catch (error) {
        console.error('Error submitting test data:', error);
        return { success: false, error: error.message };
    }
}

async function insertTestFile(metadata) {
    try {
        const supabase = await getSupabaseWithAuth();
        const testJson = metadata.data;
        const { data, error } = await supabase
            .from('Test Files')
            .insert([
                {
                    distance: metadata.distance || null,
                    timeStamp: testJson.timeStamp || [],
                    displacement: testJson.displacement || [],
                    velocity: testJson.velocity || [],
                    heading: testJson.heading || [],
                    trajectory_y: testJson.trajectory_y || [],
                    trajectory_x: testJson.trajectory_x || [],
                    gyro_left: Array.isArray(testJson.gyro_left)
                        ? testJson.gyro_left.map(val => typeof val === 'object' ? val : { value: parseInt(val, 10) })
                        : testJson.gyro_left ? [{ value: parseInt(testJson.gyro_left, 10) }] : null,
                    gyro_right: Array.isArray(testJson.gyro_right)
                        ? testJson.gyro_right.map(val => typeof val === 'object' ? val : { value: parseInt(val, 10) })
                        : testJson.gyro_right ? [{ value: parseInt(testJson.gyro_right, 10) }] : null,
                    accel_left: Array.isArray(testJson.accel_left)
                        ? testJson.accel_left.map(val => typeof val === 'object' ? val : { value: parseInt(val, 10) })
                        : testJson.accel_left ? [{ value: parseInt(testJson.accel_left, 10) }] : null,
                    accel_right: Array.isArray(testJson.accel_right)
                        ? testJson.accel_right.map(val => typeof val === 'object' ? val : { value: parseInt(val, 10) })
                        : testJson.accel_right ? [{ value: parseInt(testJson.accel_right, 10) }] : null,
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

async function insertTestInfo(metadata) {
    try {
        const supabase = await getSupabaseWithAuth();
        const { data, error } = await supabase
            .from('Test Info')
            .insert([
                {
                    test_name: metadata.name || `Test ${metadata.test_file_id}`,
                    comments: metadata.comments || "",
                    flags: metadata.flags || [],
                    test_file_id: metadata.test_file_id, // Foreign key reference
                }
            ])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data };
    } catch (err) {
        console.error('Exception in insertTestInfo:', err);
        return { success: false, error: err.message };
    }
}

async function fetchTestFiles(numberOfTests = null) {
    try {
        const supabase = await getSupabaseWithAuth();
        console.log(supabase)

        // Test authentication first
        const { data: authTest, error: authError } = await supabase.auth.getUser();
        console.log('Auth check result:', authTest?.user?.email || 'Not authenticated',
            authError ? `Error: ${authError.message}` : 'No error');

        const { data: testFiles, error } = await supabase
            .from('Test Files')
            .select('*');

        if (error) {
            console.error('Error fetching test files:', error);
            return { success: false, error: error.message };
        }

        const { data: testInfo, error: infoError } = await supabase
            .from('Test Info')
            .select('*');

        if (infoError) {
            console.error('Error fetching test info:', infoError);
            return { success: false, error: infoError.message };
        }

        // Combine test files and test info safely
        const combinedData = testFiles.map(file => {
            const info = testInfo.find(info => info.test_file_id === file.id);
            return {
                ...file,
                // Use file's created_at if info is null or doesn't have created_at
                created_at: (info && info.created_at) ? info.created_at : file.created_at,
                test_name: info ? info.test_name : null,
                comments: info ? info.comments : null,
                flags: info ? info.flags : null
            };
        });

        // Return all data or limit based on numberOfTests parameter
        combinedData.length < numberOfTests && (numberOfTests = combinedData.length);
        return {
            success: true,
            data: numberOfTests !== null ? combinedData.slice(0, numberOfTests) : combinedData
        };
    } catch (error) {
        console.error('Error fetching test files:', error);
        return { success: false, error: error.message };
    }
}

async function updateTestName(testId, newName) {
    try {
        const supabase = await getSupabaseWithAuth();
        // Find the Test Info record related to this test file
        const { data: testInfo, error: findError } = await supabase
            .from('Test Info')
            .select('*')
            .eq('test_file_id', testId)
            .single();

        if (findError) {
            console.error('Error finding test info:', findError);
            return { success: false, error: findError.message };
        }

        // Update the test name
        const { data, error } = await supabase
            .from('Test Info')
            .update({ test_name: newName })
            .eq('id', testInfo.id)
            .select();

        if (error) {
            console.error('Error updating test name:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error updating test name:', error);
        return { success: false, error: error.message };
    }
}

async function fetchAnnouncements() {
    try {
        const supabase = await getSupabaseWithAuth();
        let { data: announcements, error } = await supabase
            .from('announcements')
            .select('*')
        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data: announcements };
    } catch (error) {
        console.error('Error fetching announcements: ', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    submitTestData,
    fetchTestFiles,
    updateTestName,
    fetchAnnouncements
};