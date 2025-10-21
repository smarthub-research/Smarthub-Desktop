// Helper that compares two numeric arrays and reports at most `maxReport` mismatches
// It throws a single Error with a concise summary instead of letting Jest dump huge diffs.
function assertArraysClose(actual, expected, precision = 6, name = 'array', maxReport = 5) {
    if (!Array.isArray(actual) || !Array.isArray(expected)) {
        throw new Error(`${name}: both actual and expected must be arrays`);
    }
    if (actual.length !== expected.length) {
        throw new Error(`${name}: length mismatch actual=${actual.length} expected=${expected.length}`);
    }
    const mismatches = [];
    for (let i = 0; i < actual.length; i++) {
        const a = Number(actual[i]);
        const e = Number(expected[i]);
        // Use toFixed compare to replicate toBeCloseTo behaviour
        const diff = Math.abs(a - e);
        const tol = Math.pow(10, -precision) / 2; // approximate tolerance
        if (!Number.isFinite(a) || !Number.isFinite(e) || diff > tol) {
            if (mismatches.length < maxReport) {
                mismatches.push({index: i, actual: a, expected: e, diff});
            } else if (mismatches.length === maxReport) {
                mismatches.push({index: '...'});
            }
        }
    }
    if (mismatches.length > 0) {
        const summaryLines = mismatches.map(m => {
            if (m.index === '...') return '...';
            return `idx ${m.index}: actual=${m.actual} expected=${m.expected} diff=${m.diff}`;
        }).join('\n');
        throw new Error(`${name}: ${mismatches.length} mismatches (showing up to ${maxReport}):\n${summaryLines}`);
    }
    // if no mismatches, assertion passes (no return needed)
}

module.exports = {
    assertArraysClose
}