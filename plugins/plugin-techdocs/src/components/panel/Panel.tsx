import React from 'react';

import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/shared';
import { IPanelOptions } from '../../utils/interfaces';
import TableOfContentsWrapper from './TableOfContentsWrapper';
import TechDocsList from './TechDocsList';

interface ITechDocsPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<ITechDocsPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  setDetails,
}: ITechDocsPluginPanelProps) => {
  if (options && options.type && options.type === 'list') {
    return (
      <PluginPanel title={title} description={description}>
        <TechDocsList instance={instance} />
      </PluginPanel>
    );
  }

  if (options && options.type && options.type === 'toc' && options.service) {
    return (
      <TableOfContentsWrapper instance={instance} title={title} description={description} service={options.service} />
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for TechDocs panel are missing or invalid"
      details="The panel doesn't contain the required options to view the TechDocs."
      documentation="https://kobs.io/main/plugins/techdocs"
    />
  );
};

export default Panel;
