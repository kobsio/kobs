import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';

import { IQuery, ISQLData } from '../../utils/interfaces';
import { PluginCard } from '@kobsio/plugin-core';
import SQLActions from './SQLActions';
import SQLTable from './SQLTable';

interface ISQLProps {
  name: string;
  title: string;
  description?: string;
  queries: IQuery[];
}

const SQL: React.FunctionComponent<ISQLProps> = ({ name, title, description, queries }: ISQLProps) => {
  const [showSelect, setShowSelect] = useState<boolean>(false);
  const [selectedQueryIndex, setSelectedQueryIndex] = useState<number>(0);

  const { isError, isFetching, isLoading, error, data, refetch } = useQuery<ISQLData, Error>(
    ['sql/query', name, queries, selectedQueryIndex],
    async () => {
      try {
        if (!queries[selectedQueryIndex].query) {
          throw new Error('Query is missing');
        }

        const response = await fetch(
          `/api/plugins/sql/${name}/query?query=${encodeURIComponent(queries[selectedQueryIndex].query || '')}`,
          {
            method: 'get',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json;
        } else {
          if (json.error) {
            throw new Error(json.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
    {
      keepPreviousData: true,
    },
  );

  const select = (
    event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    value: string | SelectOptionObject,
  ): void => {
    const queryIndex = queries.map((query) => query.name).indexOf(value as string);
    setSelectedQueryIndex(queryIndex);
    setShowSelect(false);
  };

  return (
    <PluginCard
      title={title}
      description={description}
      actions={<SQLActions name={name} queries={queries} isFetching={isFetching} />}
    >
      <div>
        {queries.length > 1 ? (
          <div>
            <Select
              variant={SelectVariant.single}
              typeAheadAriaLabel="Select query"
              placeholderText="Select query"
              onToggle={(): void => setShowSelect(!showSelect)}
              onSelect={select}
              selections={queries[selectedQueryIndex].name}
              isOpen={showSelect}
            >
              {queries.map((query, index) => (
                <SelectOption key={index} value={query.name} description={query.query} />
              ))}
            </Select>
            <p>&nbsp;</p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Alert
            variant={AlertVariant.danger}
            isInline={true}
            title="Could not get query results"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): Promise<QueryObserverResult<ISQLData, Error>> => refetch()}>
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data ? (
          <SQLTable columns={data.columns} rows={data.rows} columnOptions={queries[selectedQueryIndex].columns} />
        ) : null}
      </div>
    </PluginCard>
  );
};

export default SQL;
