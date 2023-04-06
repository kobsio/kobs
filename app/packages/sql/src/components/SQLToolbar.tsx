import { sql, MySQL, PostgreSQL, StandardSQL } from '@codemirror/lang-sql';
import { APIContext, APIError, Editor, IPluginInstance } from '@kobsio/core';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useEffect, useState, useContext } from 'react';

import { ISQLMetaInfo } from './types';
import { Clickhouse } from './utils/utils';

interface ILogsToolbar {
  instance: IPluginInstance;
  onSearch: (query: string) => void;
  query: string;
}

const dialectFromString = (v = '') => {
  switch (v) {
    case 'postgresql':
      return PostgreSQL;
    case 'mysql':
      return MySQL;
    case 'clickhouse':
      return Clickhouse;
    default:
      return StandardSQL;
  }
};

/**
 * SQLToolbar renders a an editor for entering sql queries
 */
const SQLToolbar: FunctionComponent<ILogsToolbar> = ({ query: initialQuery, instance, onSearch }) => {
  const { client } = useContext(APIContext);
  const [query, setQuery] = useState<string>(initialQuery);
  const { data, isLoading } = useQuery<ISQLMetaInfo | null, APIError>(['sql/meta', instance], () => {
    return client.get<ISQLMetaInfo>(`/api/plugins/sql/meta`, {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    });
  });

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  if (isLoading) {
    return <></>;
  }

  const extension = [sql({ dialect: dialectFromString(data?.dialect), schema: data?.completions })];
  const handleSubmit = () => {
    return onSearch(query);
  };

  return (
    <Editor
      language={extension}
      minimal={true}
      value={query}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={(value: any) => setQuery(value || '')}
      handleSubmit={handleSubmit}
    />
  );
};

export default SQLToolbar;
