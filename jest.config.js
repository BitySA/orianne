module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
    preset: 'ts-jest/presets/js-with-ts-esm', // or other ESM presets
      globals: {
              'ts-jest': {
                        useESM: true,
              },
      },
        moduleNameMapper: {
                '^(\\.{1,2}/.*)\\.js$': '$1',
        },
};
