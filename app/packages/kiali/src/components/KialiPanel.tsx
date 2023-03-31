import {
  GridContext,
  IGridContext,
  IPluginPanelProps,
  pluginBasePath,
  PluginPanel,
  PluginPanelActionLinks,
  PluginPanelError,
} from '@kobsio/core';
import { Box } from '@mui/material';
import { FunctionComponent, useContext } from 'react';

import { Topology } from './Topology';

interface IOptions {
  application?: string;
  namespaces?: string[];
}

const KialiPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  title,
  description,
  options,
  instance,
  times,
}) => {
  const gridContext = useContext<IGridContext>(GridContext);

  if (
    options &&
    options.namespaces &&
    Array.isArray(options.namespaces) &&
    options.namespaces.length === 1 &&
    options.application
  ) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PluginPanelActionLinks
            links={[
              {
                link: `${pluginBasePath(instance)}?namespaces[]=${encodeURIComponent(options.namespaces[0])}&time=${
                  times.time
                }&timeEnd=${times.timeEnd}&timeStart=${times.timeStart}`,
                title: 'Explore',
              },
            ]}
          />
        }
      >
        {gridContext.autoHeight ? (
          <Box height="500px">
            <Topology
              instance={instance}
              application={options.application}
              namespaces={options.namespaces}
              times={times}
            />
          </Box>
        ) : (
          <Topology
            instance={instance}
            application={options.application}
            namespaces={options.namespaces}
            times={times}
          />
        )}
      </PluginPanel>
    );
  }

  if (options && options.namespaces && Array.isArray(options.namespaces) && options.namespaces.length > 0) {
    const n = options.namespaces?.map((namespace) => `&namespaces[]=${encodeURIComponent(namespace)}`).join('');

    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PluginPanelActionLinks
            links={[
              {
                link: `${pluginBasePath(instance)}?${n}&time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${
                  times.timeStart
                }`,
                title: 'Explore',
              },
            ]}
          />
        }
      >
        {gridContext.autoHeight ? (
          <Box height="500px">
            <Topology instance={instance} namespaces={options.namespaces} times={times} />
          </Box>
        ) : (
          <Topology instance={instance} namespaces={options.namespaces} times={times} />
        )}
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for Kiali plugin"
      details="One of the required options is missing."
      example={`# Show a topology graph for a list of namespaces
plugin:
  name: kiali
  type: kiali
  options:
    namespaces:
      - mynamespace1
      - mynamespace2
# Show a topology graph for a single application
plugin:
  name: kiali
  type: kiali
  options:
    namespaces:
      - mynamespace1
    application: myapplication1`}
      documentation="https://kobs.io/main/plugins/kiali"
    />
  );
};

export default KialiPanel;
