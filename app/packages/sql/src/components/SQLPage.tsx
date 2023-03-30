import { APIContext, APIError, IPluginPageProps, Page, useQueryState, UseQueryWrapper } from '@kobsio/core';
import { Card } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';

import SQLTable from './SQLTable';
import SQLToolbar from './SQLToolbar';
import { IRow } from './types';

const defaultDescription = 'Access the data of an relational database management system.';

export interface ISearch {
  query: string;
}

export const defaultSearch: ISearch = {
  query: '',
};

interface IResult {
  columns: string[];
  rows: IRow[];
}

/**
 * LogsPage displays the klogs plugin page that allows the user to search for logs
 * and compose a table with custom columns
 */
const SQLPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const { client } = useContext(APIContext);
  const [search, setSearch] = useQueryState<ISearch>(defaultSearch);

  const queryResult = useQuery<IResult | null, APIError>([search.query], () => {
    if (search.query === '') {
      return null;
    }
    return client.get<IResult>(`/api/plugins/sql/query?query=${search.query}`, {
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
      toolbar={<SQLToolbar onSearch={handleSearch} query={search.query} />}
    >
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
        <Card
          sx={{
            // table should take full width of the page
            maxWidth: {
              md: 'calc(100vw - 358px)',
              sm: '100vw',
            },
          }}
        >
          <SQLTable columns={queryResult?.data?.columns || []} rows={queryResult?.data?.rows || []} />
        </Card>
      </UseQueryWrapper>
    </Page>
  );
};

export default SQLPage;
