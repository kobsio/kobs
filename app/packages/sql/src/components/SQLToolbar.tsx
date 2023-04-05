import { Editor } from '@kobsio/core';
import { FunctionComponent, useEffect, useState } from 'react';

interface ILogsToolbar {
  onSearch: (query: string) => void;
  query: string;
}

/**
 * SQLToolbar renders a an editor for entering sql queries
 */
const SQLToolbar: FunctionComponent<ILogsToolbar> = ({ query: initialQuery, onSearch }) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const handleSubmit = () => {
    return onSearch(query);
  };

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <Editor
      language="sql"
      minimal={true}
      value={query}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={(value: any) => setQuery(value || '')}
      handleSubmit={handleSubmit}
    />
  );
};

export default SQLToolbar;
