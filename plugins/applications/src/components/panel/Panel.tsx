import React, { memo } from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import ApplicationsGallery from './ApplicationsGallery';
import ApplicationsTopology from './ApplicationsTopology';
import { IPanelOptions } from '../../utils/interfaces';
import PanelActions from './PanelActions';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

// Panel implements the panel component for the applications plugin. The component is also used in the applications
// page. The clusters and namespaces are used from the corresponding key in the options object. If a user doesn't
// provided a cluster/namespace we will use the one from the defaults object.
export const Panel: React.FunctionComponent<IPanelProps> = ({
  defaults,
  title,
  description,
  options,
  showDetails,
}: IPanelProps) => {
  // We have to validate that the required options object was provided in the Application CR by a user. This is
  // important so that the React UI doesn't crash, when the user didn't use the plugin correctly.
  if (!options) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for Application panel are missing"
        details=""
        documentation="https://kobs.io/plugins/applications.html"
      />
    );
  }

  // We have to check if the user selected the topology view and mount the corresponding component, because the data
  // handling is different for the gallery and topology view.
  // When a title is set we are sure that the component is used in a dashboard so we will wrap the topology component in
  // the PluginCard component.
  if (options.view === 'topology') {
    const topology = (
      <ApplicationsTopology
        clusters={options.clusters || [defaults.cluster]}
        namespaces={options.namespaces || [defaults.namespace]}
        showDetails={showDetails}
      />
    );

    if (title) {
      return (
        <PluginCard
          title={title}
          description={description}
          transparent={true}
          actions={
            <PanelActions
              view="topology"
              clusters={options.clusters || [defaults.cluster]}
              namespaces={options.namespaces || [defaults.namespace]}
            />
          }
        >
          {topology}
        </PluginCard>
      );
    }

    return topology;
  }

  // If the user doesn't selected a view, we assume he wants to have the gallery view. As for the topology we also have
  // to check if the component is used in a dashboard or in the applications page.
  const gallery = (
    <ApplicationsGallery
      clusters={options.clusters || [defaults.cluster]}
      namespaces={options.namespaces || [defaults.namespace]}
      team={options.team}
      showDetails={showDetails}
    />
  );

  if (title) {
    return (
      <PluginCard
        title={title}
        description={description}
        transparent={true}
        actions={
          options.team ? undefined : (
            <PanelActions
              view="gallery"
              clusters={options.clusters || [defaults.cluster]}
              namespaces={options.namespaces || [defaults.namespace]}
            />
          )
        }
      >
        {gallery}
      </PluginCard>
    );
  }

  return gallery;
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
