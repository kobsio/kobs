import React from 'react';

import { IPluginPanelProps, PluginPanelError } from '@kobsio/shared';
import ArtifactsPanel from './ArtifactsPanel';
import { IPanelOptions } from '../../utils/interfaces';
import ProjectsPanel from './ProjectsPanel';
import RepositoriesPanel from './RepositoriesPanel';

interface IHarborPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IHarborPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  setDetails,
}: IHarborPluginPanelProps) => {
  if (options && options.type === 'projects') {
    return <ProjectsPanel instance={instance} title={title} description={description} />;
  }

  if (options && options.type === 'repositories' && options.repositories && options.repositories.projectName) {
    return (
      <RepositoriesPanel
        instance={instance}
        title={title}
        description={description}
        projectName={options.repositories.projectName}
        query={options.repositories.query || ''}
      />
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
      <ArtifactsPanel
        instance={instance}
        title={title}
        description={description}
        projectName={options.artifacts.projectName}
        repositoryName={options.artifacts.repositoryName}
        query={options.artifacts.query || ''}
        setDetails={setDetails}
      />
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for Harbor panel are missing or invalid"
      details="The panel doesn't contain the required options to get data from the Harbor registry."
      documentation="https://kobs.io/main/plugins/harbor"
    />
  );
};

export default Panel;
