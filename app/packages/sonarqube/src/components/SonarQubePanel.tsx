import { IPluginPanelProps, PluginPanel, PluginPanelActionLinks, PluginPanelError } from '@kobsio/core';
import { FunctionComponent } from 'react';

import Measures from './Measures';

import { example } from '../utils/utils';

interface IOptions {
  metricKeys: string[];
  project: string;
}

const SonarQubePanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({ title, description, options, instance }) => {
  if (options && options.project) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          instance?.options?.address && (
            <PluginPanelActionLinks
              links={[
                {
                  link: `${instance.options.address}/dashboard?id=${encodeURIComponent(options.project)}`,
                  targetBlank: true,
                  title: 'Open in SonarQube',
                },
              ]}
            />
          )
        }
      >
        <Measures instance={instance} project={options.project} metricKeys={options.metricKeys} />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for SonarQube plugin"
      details="One of the required options is missing."
      example={example}
      documentation="https://kobs.io/main/plugins/sonarqube"
    />
  );
};

export default SonarQubePanel;
