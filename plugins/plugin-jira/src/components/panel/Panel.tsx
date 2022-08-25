import React from 'react';

import { IPluginPanelProps, PluginPanelError } from '@kobsio/shared';
import { IPanelOptions } from '../../utils/interfaces';
import Issues from '../jira/Issues';

interface IJiraPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IJiraPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  setDetails,
}: IJiraPluginPanelProps) => {
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
