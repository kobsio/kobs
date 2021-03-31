import React, { useState } from 'react';

import { IJaegerOptions } from 'plugins/jaeger/helpers';
import { IPluginProps } from 'utils/plugins';
import JaegerPluginToolbar from 'plugins/jaeger/JaegerPluginToolbar';
import JaegerTraces from 'plugins/jaeger/JaegerTraces';
import PluginDataMissing from 'components/plugins/PluginDataMissing';

// ElasticsearchPlugin is the plugin component for the Elasticsearch plugin. It renders a toolbar, which allows a user
// to select the specified queries for an application.
const ElasticsearchPlugin: React.FunctionComponent<IPluginProps> = ({
  name,
  description,
  plugin,
  showDetails,
}: IPluginProps) => {
  const initialQuery = plugin.jaeger && plugin.jaeger.queriesList.length > 0 ? plugin.jaeger.queriesList[0] : undefined;

  const [options, setOptions] = useState<IJaegerOptions>({
    limit: '20',
    maxDuration: '',
    minDuration: '',
    operation: initialQuery ? initialQuery.operation : '',
    queryName: initialQuery ? initialQuery.name : '',
    service: initialQuery ? initialQuery.service : '',
    tags: initialQuery ? initialQuery.tags : '',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 3600,
  });

  // When the elasticsearch property of the plugin is missing, we use the shared PluginDataMissing component, with a
  // link to the corresponding documentation for the Elasticsearch plugin.
  if (!plugin.jaeger) {
    return (
      <PluginDataMissing
        title="Jaeger properties are missing"
        description="The Jaeger properties are missing in your CR for this application. Visit the documentation to learn more on how to use the Jaeger plugin in an Application CR."
        documentation="https://kobs.io"
        type="jaeger"
      />
    );
  }

  return (
    <React.Fragment>
      <JaegerPluginToolbar
        limit={options.limit}
        maxDuration={options.maxDuration}
        minDuration={options.minDuration}
        queries={plugin.jaeger.queriesList}
        queryName={options.queryName}
        timeEnd={options.timeEnd}
        timeStart={options.timeStart}
        setQuery={(name: string, service: string, operation: string, tags: string): void =>
          setOptions({ ...options, operation: operation, queryName: name, service: service, tags: tags })
        }
        setOptions={(
          limit: string,
          maxDuration: string,
          minDuration: string,
          timeEnd: number,
          timeStart: number,
        ): void =>
          setOptions({
            ...options,
            limit: limit,
            maxDuration: maxDuration,
            minDuration: minDuration,
            timeEnd: timeEnd,
            timeStart: timeStart,
          })
        }
      />
      <p>&nbsp;</p>
      {options.service && options.queryName ? (
        <JaegerTraces
          name={name}
          queryName={options.queryName}
          limit={options.limit}
          maxDuration={options.maxDuration}
          minDuration={options.minDuration}
          operation={options.operation}
          service={options.service}
          tags={options.tags}
          timeEnd={options.timeEnd}
          timeStart={options.timeStart}
          setTrace={showDetails}
        />
      ) : null}
    </React.Fragment>
  );
};

export default ElasticsearchPlugin;
