import {
  APIContext,
  APIError,
  IPluginInstance,
  PluginPanel,
  PluginPanelActionLinks,
  UseQueryWrapper,
} from '@kobsio/core';
import { FormControl, Select, MenuItem, ListItem, List, ListItemText } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';
import { FunctionComponent, useContext, useState } from 'react';

import SQLTable from './SQLTable';
import { IQuery, ISQLData } from './types';

/**
 * utility for creating the path to the sql plugin with the given query as query-parameter
 **/
const uriFromQuery = (instance: IPluginInstance, query: IQuery) => {
  const path = `/plugins/${instance.cluster}/sql/${instance.name}`;
  const search = queryString.stringify(
    {
      query: query.query,
    },
    { arrayFormat: 'bracket', skipEmptyString: false, skipNull: false },
  );

  return [path, search].join('?');
};

interface IPanelTableViewProps {
  description?: string;
  instance: IPluginInstance;
  queries: IQuery[];
  title: string;
}

const PanelTableView: FunctionComponent<IPanelTableViewProps> = ({ instance, title, description, queries }) => {
  const { client } = useContext(APIContext);
  const [currentQuery, setCurrentQuery] = useState(0);
  const queryResult = useQuery<ISQLData | null, APIError>([currentQuery], () => {
    if (queries.length === 0) {
      return null;
    }

    const query = queries[currentQuery].query;
    if (query === '') {
      return null;
    }

    return client.get<ISQLData>(`/api/plugins/sql/query?query=${query}`, {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    });
  });

  return (
    <PluginPanel
      description={description}
      title={title}
      actions={
        <PluginPanelActionLinks
          links={[
            {
              link: uriFromQuery(instance, queries[currentQuery]),
              title: `explore "${queries[currentQuery].name || queries[currentQuery].query}"`,
            },
          ]}
          isFetching={false}
        />
      }
    >
      {queries.length > 1 && (
        <FormControl fullWidth={true} size="small">
          <Select
            value={currentQuery}
            onChange={(e) => setCurrentQuery(Number(e.target.value) || 0)}
            renderValue={(selected) => queries[selected].name || queries[selected].query}
          >
            {queries.map((query, i) => (
              <MenuItem key={i} value={i}>
                <List dense={true}>
                  <ListItem sx={{ p: 0 }}>
                    <ListItemText primary={query.name} secondary={query.query}>
                      {query.name}
                    </ListItemText>
                  </ListItem>
                </List>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <UseQueryWrapper
        isError={queryResult.isError}
        error={queryResult.error}
        isLoading={queryResult.isLoading}
        refetch={queryResult.refetch}
        errorTitle="Failed to load applications"
        isNoData={!queryResult.data}
        noDataTitle="No logs found"
        noDataMessage="There were no logs found for your search query"
      >
        <SQLTable
          columnOptions={queries[currentQuery].columns}
          columns={queryResult.data?.columns || []}
          rows={queryResult.data?.rows || []}
        />
      </UseQueryWrapper>
    </PluginPanel>
  );
};

export default PanelTableView;
