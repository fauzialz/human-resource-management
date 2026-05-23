const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = () => {
  const { dependencies = {} } = require('./package.json');
  // Workspace packages must be bundled, not externalized — they don't exist
  // in the production image's node_modules.
  const externalDependencies = Object.keys(dependencies).filter(
    (dep) => !dep.startsWith('@human-resource-management/'),
  );

  return {
    output: {
      path: join(__dirname, 'dist'),
      clean: true,
      ...(process.env.NODE_ENV !== 'production' && {
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
      }),
    },
    plugins: [
      new NxAppWebpackPlugin({
        target: 'node',
        compiler: 'tsc',
        main: './src/main.ts',
        tsConfig: './tsconfig.webpack.json',
        assets: ['./src/assets'],
        optimization: false,
        outputHashing: 'none',
        generatePackageJson: true,
        sourceMap: true,
        externalDependencies,
      }),
    ],
  };
};
