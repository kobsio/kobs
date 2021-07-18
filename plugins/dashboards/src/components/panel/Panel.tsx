import { Gallery, GalleryItem } from '@patternfly/react-core';
import React, { memo } from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IReference } from '../../utils/interfaces';
import PanelItem from './PanelItem';

interface IPanelProps extends IPluginPanelProps {
  options?: IReference[];
}

// Panel implements the panel component for the dashboards plugin.
export const Panel: React.FunctionComponent<IPanelProps> = ({ defaults, title, description, options }: IPanelProps) => {
  if (!options || !Array.isArray(options)) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for Dashboards panel are missing or invalid"
        details="The panel doesn't contain the required options to get dashboards or the provided options are invalid."
        documentation="https://kobs.io/plugins/dashboards.html"
      />
    );
  }

  return (
    <PluginCard title={title} description={description} transparent={true}>
      <Gallery hasGutter={true} maxWidths={{ default: '100%' }}>
        {options.map((reference, index) => (
          <GalleryItem key={index}>
            <PanelItem defaults={defaults} reference={reference} />
          </GalleryItem>
        ))}
      </Gallery>
    </PluginCard>
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
