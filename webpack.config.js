const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.ts',  // Assuming your entry point is src/index.ts
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js'  // Output file
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']  // Add '.js' if your project uses JS files as well
  }
};

