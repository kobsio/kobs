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
  const [selectedQuery, setSelectedQuery] = useState<IQuery>(queries[0]);

  const { isError, isFetching, error, data, refetch } = useQuery<ISQLData, Error>(
    ['clickhouse/sql', selectedQuery],
    async ({ pageParam }) => {
      try {
        const response = await fetch(`/api/plugins/clickhouse/sql/${name}?query=${selectedQuery.query}`, {
          method: 'get',
        });
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
  );

  const select = (
    event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    value: string | SelectOptionObject,
  ): void => {
    const query = queries.filter((query) => query.name === value);
    if (query.length === 1) {
      setSelectedQuery(query[0]);
    }
    setShowSelect(false);
  };

  return (
    <PluginCard title={title} description={description} actions={<SQLActions name={name} queries={queries} />}>
      <div>
        {queries.length > 1 ? (
          <div>
            <Select
              variant={SelectVariant.single}
              typeAheadAriaLabel="Select query"
              placeholderText="Select query"
              onToggle={(): void => setShowSelect(!showSelect)}
              onSelect={select}
              selections={selectedQuery.name}
              isOpen={showSelect}
            >
              {queries.map((query, index) => (
                <SelectOption key={index} value={query.name} description={query.query} />
              ))}
            </Select>
            <p>&nbsp;</p>
          </div>
        ) : null}

        {isFetching ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Alert
            variant={AlertVariant.danger}
            isInline={true}
            title="Could not get logs"
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
          <SQLTable columns={data.columns} rows={data.rows} />
        ) : null}
      </div>
    </PluginCard>
  );
};

export default SQL;
