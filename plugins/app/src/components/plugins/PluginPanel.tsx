/* eslint-disable react/prop-types */
import { Alert, AlertVariant, Skeleton } from '@patternfly/react-core';
import React, { useContext } from 'react';

import { IPluginsContext, PluginsContext } from '../../context/PluginsContext';
import { ITimes, PluginPanel as SharedPluginPanel } from '@kobsio/shared';
import AppPanel from './AppPanel';
import Module from '../module/Module';

interface IPluginPanelProps {
  title: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
  satellite: string;
  type: string;
  name: string;
  times?: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const PluginPanel: React.FunctionComponent<IPluginPanelProps> = ({
  title,
  description,
  satellite,
  type,
  name,
  options,
  times,
  setDetails,
}: IPluginPanelProps) => {
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const instance = pluginsContext.getInstance(satellite, type, name);

  if (type === 'app') {
    return (
      <AppPanel
        title={title}
        description={description}
        satellite={satellite}
        name={name}
        options={options}
        times={times}
        setDetails={setDetails}
      />
    );
  }

  const loadingContent = (): React.ReactElement => {
    return (
      <SharedPluginPanel title={title} description={description}>
        <React.Fragment>
          <Skeleton width="100%" fontSize="sm" screenreaderText="Loading content" />
          <br />
          <Skeleton width="100%" fontSize="sm" screenreaderText="Loading content" />
          <br />
          <Skeleton width="75%" fontSize="sm" screenreaderText="Loading content" />
        </React.Fragment>
      </SharedPluginPanel>
    );
  };

  const errorContent = (props: { title: string; children: React.ReactElement }): React.ReactElement => {
    return (
      <SharedPluginPanel title={title} description={description}>
        <Alert isInline={true} variant={AlertVariant.danger} title={props.title}>
          {props.children}
        </Alert>
      </SharedPluginPanel>
    );
  };

  if (!instance) {
    return (
      <SharedPluginPanel title={title} description={description}>
        <Alert isInline={true} variant={AlertVariant.danger} title="Plugin instance was not found">
          <p>
            The plugin instance with the name <b>{name}</b> and the type <b>{type}</b> was not found on satellite{' '}
            <b>{satellite}</b>
          </p>
        </Alert>
      </SharedPluginPanel>
    );
  }

  return (
    <Module
      version={pluginsContext.version}
      name={instance.type}
      module="./Panel"
      props={{
        description: description,
        instance: instance,
        options: options,
        setDetails: setDetails,
        times: times,
        title: title,
      }}
      errorContent={errorContent}
      loadingContent={loadingContent}
    />
  );
};

export default PluginPanel;
