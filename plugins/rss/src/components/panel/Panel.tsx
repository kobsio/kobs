import React, { memo } from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import Feed from './Feed';
import { IPanelOptions } from '../../utils/interfaces';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({
  title,
  description,
  options,
  showDetails,
}: IPanelProps) => {
  if (!options || !options.urls || !Array.isArray(options.urls) || options.urls.length === 0) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for RSS panel are missing or invalid"
        details="The panel doesn't contain the a text property."
        documentation="https://kobs.io/plugins/rss"
      />
    );
  }

  return (
    <PluginCard title={title} description={description} transparent={true}>
      <Feed urls={options.urls} sortBy={options.sortBy || 'published'} setDetails={showDetails} />
    </PluginCard>
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (
    prevProps.title === nextProps.title &&
    prevProps.description === nextProps.description &&
    prevProps.options?.urls === nextProps.options?.urls
  ) {
    return true;
  }

  return false;
});
