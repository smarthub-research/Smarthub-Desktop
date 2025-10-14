#!/usr/bin/env node

/**
 * Standalone script to export test results to JSON
 * Usage: node runExport.js [input-file] [output-file] [gain-left] [gain-right]
 * 
 * Examples:
 *   node runExport.js
 *   node runExport.js ./testing.json my_results.json
 *   node runExport.js ./testing.json my_results.json 1.13 1.12
 */

const { exportFromTestDataFile } = require('./exportTestResults');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const inputFile = args[0] || './testing.json';
const outputFile = args[1] || 'exported_results.json';
const gainLeft = args[2] ? parseFloat(args[2]) : 1.13;
const gainRight = args[3] ? parseFloat(args[3]) : 1.12;

// Resolve the input file path
const inputPath = path.resolve(__dirname, inputFile);

console.log('╔════════════════════════════════════════════════════╗');
console.log('║       Test Results Export Tool                    ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log('');
console.log(`📂 Input file:   ${inputPath}`);
console.log(`📝 Output file:  ${outputFile}`);
console.log(`⚙️  Gain left:    ${gainLeft}`);
console.log(`⚙️  Gain right:   ${gainRight}`);
console.log('');
console.log('Starting export process...');
console.log('─'.repeat(52));

// Run the export
exportFromTestDataFile(inputPath, outputFile, gainLeft, gainRight)
    .then(result => {
        console.log('─'.repeat(52));
        console.log('');
        console.log('🎉 Export completed successfully!');
        console.log(`📊 Total data points: ${result.dataPoints}`);
        console.log(`💾 Output saved to: ${result.outputPath}`);
        console.log('');
        process.exit(0);
    })
    .catch(error => {
        console.error('─'.repeat(52));
        console.error('');
        console.error('❌ Export failed with error:');
        console.error(error.message);
        console.error('');
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Make sure the FastAPI backend is running on http://localhost:8000');
            console.error('   Run: npm run fastapi:start');
        }
        console.error('');
        process.exit(1);
    });
