import React, { memo } from 'react';
import cytoscape from 'cytoscape';

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
  title,
  description,
  options,
  times,
  pluginOptions,
  setDetails,
}: IPanelProps) => {
  // We have to check if the user selected the topology view and mount the corresponding component, because the data
  // handling is different for the gallery and topology view.
  // When a title is set we are sure that the component is used in a dashboard so we will wrap the topology component in
  // the PluginCard component.
  if (options && options.view === 'topology' && options.clusters && options.namespaces !== undefined && times) {
    const customStyleSheet: cytoscape.Stylesheet[] = [];

    if (pluginOptions && pluginOptions.topology && Array.isArray(pluginOptions.topology)) {
      for (const topologyItem of pluginOptions.topology) {
        customStyleSheet.push({
          selector: `node[type='${topologyItem.type}']`,
          style: {
            'background-color': topologyItem.color || '#0066cc',
            shape: topologyItem.shape || 'roundrectangle',
          },
        });
        customStyleSheet.push({
          selector: `node[type='${topologyItem.type}-not-selected']`,
          style: {
            'background-color': topologyItem.color || '#0066cc',
            'background-opacity': 0.25,
            shape: topologyItem.shape || 'roundrectangle',
          },
        });
      }
    }

    const topology = (
      <ApplicationsTopology
        clusters={options.clusters}
        namespaces={options.namespaces}
        tags={options.tags || []}
        times={times}
        customStyleSheet={customStyleSheet}
        setDetails={setDetails}
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
              clusters={options.clusters}
              namespaces={options.namespaces}
              tags={options.tags || []}
            />
          }
        >
          {topology}
        </PluginCard>
      );
    }

    return topology;
  }

  // When the user selected the gallery view, we check if he provided a team. If this is the case we can pass an empty
  // array for clusters and namespaces to the gallery component and add the team proverty.
  if (options && options.view === 'gallery' && options.team && times) {
    const gallery = (
      <ApplicationsGallery clusters={[]} namespaces={[]} tags={options.tags || []} team={options.team} times={times} />
    );

    if (title) {
      return (
        <PluginCard title={title} description={description} transparent={true}>
          {gallery}
        </PluginCard>
      );
    }

    return gallery;
  }

  // If the user doesn't provied the team option we have to check if he specify a list of clusters and namespaces. If
  // this is the case we show the galler component with the applications from the selected clusters and namespaces.
  if (options && options.view === 'gallery' && options.clusters && options.namespaces && times) {
    const gallery = (
      <ApplicationsGallery
        clusters={options.clusters}
        namespaces={options.namespaces}
        tags={options.tags || []}
        team={undefined}
        times={times}
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
              view="gallery"
              clusters={options.clusters}
              namespaces={options.namespaces}
              tags={options.tags || []}
            />
          }
        >
          {gallery}
        </PluginCard>
      );
    }

    return gallery;
  }

  // If the user doesn't selected a view, we assume he wants to have the gallery view. As for the topology we also have
  // to check if the component is used in a dashboard or in the applications page.
  if (options && options.view === 'gallery' && options.clusters && options.namespaces !== undefined && times) {
    const gallery = (
      <ApplicationsGallery
        clusters={options.clusters}
        namespaces={options.namespaces}
        tags={options.tags || []}
        team={options.team}
        times={times}
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
                clusters={options.clusters}
                namespaces={options.namespaces}
                tags={options.tags || []}
              />
            )
          }
        >
          {gallery}
        </PluginCard>
      );
    }

    return gallery;
  }

  // We have to validate that the required options object was provided in the Application CR by a user. This is
  // important so that the React UI doesn't crash, when the user didn't use the plugin correctly.
  return (
    <PluginOptionsMissing
      title={title}
      message="Options for Application panel are missing"
      details=""
      documentation="https://kobs.io/plugins/applications"
    />
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
