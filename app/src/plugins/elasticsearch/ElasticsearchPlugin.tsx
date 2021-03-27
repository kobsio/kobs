import React, { useState } from 'react';
import ListIcon from '@patternfly/react-icons/dist/js/icons/list-icon';

import ElasticsearchLogs from 'plugins/elasticsearch/ElasticsearchLogs';
import ElasticsearchPluginToolbar from 'plugins/elasticsearch/ElasticsearchPluginToolbar';
import { IElasticsearchOptions } from 'plugins/elasticsearch/helpers';
import { IPluginProps } from 'utils/plugins';
import PluginDataMissing from 'components/plugins/PluginDataMissing';

// ElasticsearchPlugin is the plugin component for the Elasticsearch plugin. It renders a toolbar, which allows a user
// to select the specified queries for an application.
const ElasticsearchPlugin: React.FunctionComponent<IPluginProps> = ({
  isInDrawer,
  name,
  description,
  plugin,
  showDetails,
}: IPluginProps) => {
  // initialQuery is the initial selected / first query in a list of queries. If the user doesn't have specified any
  // queries the initialQuery is undefined.
  const initialQuery =
    plugin.elasticsearch && plugin.elasticsearch.queriesList.length > 0
      ? plugin.elasticsearch.queriesList[0]
      : undefined;

  const [options, setOptions] = useState<IElasticsearchOptions>({
    fields: initialQuery && initialQuery.fieldsList.length > 0 ? initialQuery.fieldsList : undefined,
    query: initialQuery ? initialQuery.query : '',
    queryName: initialQuery ? initialQuery.name : '',
    scrollID: '',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 3600,
  });

  // setScrollID changed the scroll id, so that pagination is also supported in the plugins view.
  const setScrollID = (scrollID: string): void => {
    setOptions({ ...options, scrollID: scrollID });
  };

  // When the elasticsearch property of the plugin is missing, we use the shared PluginDataMissing component, with a
  // link to the corresponding documentation for the Elasticsearch plugin.
  if (!plugin.elasticsearch) {
    return (
      <PluginDataMissing
        title="Elasticsearch properties are missing"
        description="The Elasticsearch properties are missing in your CR for this application. Visit the documentation to learn more on how to use the Elasticsearch plugin in an Application CR."
        documentation="https://kobs.io"
        icon={ListIcon}
      />
    );
  }

  return (
    <React.Fragment>
      <ElasticsearchPluginToolbar
        queryName={options.queryName}
        queries={plugin.elasticsearch.queriesList}
        timeEnd={options.timeEnd}
        timeStart={options.timeStart}
        setQuery={(name: string, query: string, fields: string[]): void =>
          setOptions({ ...options, fields: fields, query: query, queryName: name })
        }
        setTimes={(timeEnd: number, timeStart: number): void =>
          setOptions({ ...options, timeEnd: timeEnd, timeStart: timeStart })
        }
      />
      <p>&nbsp;</p>
      {options.query && options.queryName ? (
        <ElasticsearchLogs
          name={name}
          queryName={options.queryName}
          isInDrawer={isInDrawer}
          fields={options.fields}
          query={options.query}
          scrollID={options.scrollID}
          timeEnd={options.timeEnd}
          timeStart={options.timeStart}
          setDocument={showDetails}
          setScrollID={setScrollID}
        />
      ) : null}
    </React.Fragment>
  );
};

export default ElasticsearchPlugin;
