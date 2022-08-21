import React from 'react';

import { IPluginPanelProps, PluginPanelError } from '@kobsio/shared';
import { IPanelOptions } from '../../utils/interfaces';
import Issues from '../jira/Issues';

interface IGitHubPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IGitHubPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  times,
  setDetails,
}: IGitHubPluginPanelProps) => {
  if (options && options.jql) {
    return (
      <Issues title={title} description={description} instance={instance} jql={options.jql} setDetails={setDetails} />
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for Jira panel are missing or invalid"
      details="The panel doesn't contain the required options to get data from Jira."
      documentation="https://kobs.io/main/plugins/jira"
    />
  );
};

export default Panel;
