import { APIContext, APIError, IPluginPageProps, Page, useQueryState, UseQueryWrapper } from '@kobsio/core';
import { Card, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';

import SQLTable from './SQLTable';
import SQLTableSelect from './SQLTableSelect';
import SQLToolbar from './SQLToolbar';
import { ISQLData } from './types';

const defaultDescription = 'Access the data of an relational database management system.';

export interface ISearch {
  query: string;
}

export const defaultSearch: ISearch = {
  query: '',
};

/**
 * SQLPage displays the plugin page that allows users to run queries
 * and view results in a table view.
 */
const SQLPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const { client } = useContext(APIContext);
  const [search, setSearch] = useQueryState<ISearch>(defaultSearch);

  const queryResult = useQuery<ISQLData | null, APIError>(['sql/query', instance, search.query], () => {
    if (search.query === '') {
      return null;
    }
    return client.get<ISQLData>(`/api/plugins/sql/query?query=${encodeURIComponent(search.query)}`, {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    });
  });

  const handleSearch = (query: string) => {
    return setSearch({ query: query });
  };

  return (
    <Page
      title="sql"
      description={instance.description || defaultDescription}
      subtitle={instance.cluster}
      toolbar={<SQLToolbar instance={instance} onSearch={handleSearch} query={search.query} />}
    >
      <Grid spacing={2} container={true}>
        <Grid xs={12} md={2} item={true}>
          <Card>
            <SQLTableSelect
              onSelectTable={(table) => setSearch({ query: `SELECT * FROM ${table} LIMIT 100` })}
              instance={instance}
            />
          </Card>
        </Grid>

        <UseQueryWrapper
          isError={queryResult.isError}
          error={queryResult.error}
          isLoading={queryResult.isLoading}
          refetch={queryResult.refetch}
          errorTitle="Failed to load results for your query"
          isNoData={!queryResult.data}
          noDataTitle="No rows found"
          noDataMessage="There were no rows found for your search query"
        >
          <Grid xs={12} md={10} item={true}>
            <Card>
              <SQLTable columns={queryResult?.data?.columns || []} rows={queryResult?.data?.rows || []} />
            </Card>
          </Grid>
        </UseQueryWrapper>
      </Grid>
    </Page>
  );
};

export default SQLPage;
