import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/core';
import { FunctionComponent } from 'react';

import Artifacts from './Artifacts';
import Projects from './Projects';
import Repositories from './Repositories';

export interface IOptions {
  artifacts?: IOptionsArtifacts;
  repositories?: IOptionsRepositories;
  type?: string;
}

export interface IOptionsRepositories {
  projectName?: string;
  query?: string;
}

export interface IOptionsArtifacts {
  projectName?: string;
  query?: string;
  repositoryName?: string;
}

const HarborPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({ title, description, options, instance }) => {
  if (options && options.type === 'projects') {
    return (
      <PluginPanel title={title} description={description}>
        <Projects instance={instance} />
      </PluginPanel>
    );
  }

  if (options && options.type === 'repositories' && options.repositories && options.repositories.projectName) {
    return (
      <PluginPanel title={title} description={description}>
        <Repositories
          instance={instance}
          projectName={options.repositories.projectName}
          query={options.repositories.query || ''}
        />
      </PluginPanel>
    );
  }

  if (
    options &&
    options.type === 'artifacts' &&
    options.artifacts &&
    options.artifacts.projectName &&
    options.artifacts.repositoryName
  ) {
    return (
      <PluginPanel title={title} description={description}>
        <Artifacts
          instance={instance}
          projectName={options.artifacts.projectName}
          repositoryName={options.artifacts.repositoryName}
          query={options.artifacts.query || ''}
        />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for Harbor plugin"
      details="One of the required options is missing."
      example={`# Projects
plugin:
  name: harbor
  type: harbor
  options:
    type: projects

# Repositories
plugin:
  name: harbor
  type: harbor
  options:
    type: repositories
    repositories:
      projectName: test

# Artifacts
plugin:
  name: harbor
  type: harbor
  options:
    type: artifacts
    artifacts:
      projectName: test
      repositoryName: repo`}
      documentation="https://kobs.io/main/plugins/harbor"
    />
  );
};

export default HarborPanel;
