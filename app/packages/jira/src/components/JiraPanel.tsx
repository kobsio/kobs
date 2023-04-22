import { IPluginPanelProps, PluginPanelError } from '@kobsio/core';
import { FunctionComponent } from 'react';

import { IssuesWrapper } from './Issues';

import { AuthContextProvider } from '../context/AuthContext';
import { example } from '../utils/utils';

interface IOptions {
  jql?: string;
}

const JiraPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({ title, description, options, instance }) => {
  if (options?.jql) {
    return (
      <AuthContextProvider title={title} description={description} instance={instance}>
        <IssuesWrapper instance={instance} title={title} description={description} jql={options.jql} />
      </AuthContextProvider>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for Jira plugin"
      details="One of the required options is missing."
      example={example}
      documentation="https://kobs.io/main/plugins/jira"
    />
  );
};

export default JiraPanel;
