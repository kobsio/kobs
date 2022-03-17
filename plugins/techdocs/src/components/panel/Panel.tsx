import React, { memo } from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';
import TableOfContentsWrapper from './TableOfContentsWrapper';
import TechDocsList from './TechDocsList';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({
  name,
  title,
  description,
  options,
  setDetails,
}: IPanelProps) => {
  if (options && options.type && options.type === 'list') {
    return (
      <PluginCard title={title} description={description}>
        <TechDocsList name={name} />
      </PluginCard>
    );
  }

  if (options && options.type && options.type === 'toc' && options.service) {
    return <TableOfContentsWrapper name={name} title={title} description={description} service={options.service} />;
  }

  return (
    <PluginOptionsMissing
      title={title}
      message="Options for TechDocs panel are missing or invalid"
      details="The panel doesn't contain the required options to render get the TechDocs data or the provided options are invalid."
      documentation="https://kobs.io/plugins/techdocs"
    />
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
