/* eslint-disable */
const deps = require('../package.json').dependencies;

module.exports = {
  name: 'azure',
  filename: 'remoteEntry.js',
  remotes: {},
  exposes: {
    './Instance': './src/components/instance/Instance.tsx',
    './Panel': './src/components/panel/Panel.tsx',
    './Page': './src/components/page/Page.tsx',
  },
  shared: {
    ...deps,
    react: {
      singleton: true,
      requiredVersion: deps.react,
    },
    'react-dom': {
      singleton: true,
      requiredVersion: deps['react-dom'],
    },
    'react-router-dom': {
      singleton: true,
      requiredVersion: deps['react-router-dom'],
    },
    '@tanstack/react-query': {
      singleton: true,
      requiredVersion: deps['@tanstack/react-query'],
    },
    '@patternfly/patternfly': {
      singleton: true,
      requiredVersion: deps['@patternfly/patternfly'],
    },
    '@patternfly/react-core': {
      singleton: true,
      requiredVersion: deps['@patternfly/react-core'],
    },
    '@patternfly/react-icons': {
      singleton: true,
      requiredVersion: deps['@patternfly/react-icons'],
    },
    '@patternfly/react-table': {
      singleton: true,
      requiredVersion: deps['@patternfly/react-table'],
    },
  },
}
/* eslint-enable */
