const path = require('path');

module.exports = {
    entry: './src/main.js', // Adjust based on your main source file
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js', // Output file name
    },
    mode: 'development', // Use 'production' for optimized builds
};
