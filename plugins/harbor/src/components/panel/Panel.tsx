import React, { memo } from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';

import Artifacts from './Artifacts';
import Projects from './Projects';
import Repositories from './Repositories';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({
  name,
  title,
  description,
  times,
  options,
  pluginOptions,
  setDetails,
}: IPanelProps) => {
  if (options && options.type === 'projects') {
    return (
      <PluginCard title={title} description={description} transparent={true}>
        <Projects name={name} />
      </PluginCard>
    );
  }

  if (options && options.type === 'repositories' && options.repositories && options.repositories.projectName) {
    return (
      <PluginCard title={title} description={description} transparent={true}>
        <Repositories
          name={name}
          projectName={options.repositories.projectName}
          query={options.repositories.query || ''}
        />
      </PluginCard>
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
      <PluginCard title={title} description={description} transparent={true}>
        <Artifacts
          name={name}
          address={pluginOptions && pluginOptions.address ? pluginOptions.address : ''}
          projectName={options.artifacts.projectName}
          repositoryName={options.artifacts.repositoryName}
          query={options.artifacts.query || ''}
          setDetails={setDetails}
        />
      </PluginCard>
    );
  }

  return (
    <PluginOptionsMissing
      title={title}
      message="Options for Harbor panel are missing or invalid"
      details="The panel doesn't contain the required options to render get the Harbor data or the provided options are invalid."
      documentation="https://kobs.io/plugins/harbor"
    />
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
