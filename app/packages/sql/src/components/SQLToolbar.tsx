import { Box, TextField } from '@mui/material';
import { FormEvent, FunctionComponent, useEffect, useState } from 'react';

import Editor from './Editor';

interface ILogsToolbar {
  onSearch: (query: string) => void;
  query: string;
}

/**
 * The `SQLToolbar` renders a an editor for entering sql queries
 */
const SQLToolbar: FunctionComponent<ILogsToolbar> = ({ query: initialQuery, onSearch }) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    return onSearch(query);
  };

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <Box component="form" sx={{ maxWidth: '100%' }} onSubmit={handleSubmit}>
      <TextField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          inputComponent: Editor,
          inputProps: {
            callSubmit: () => {
              onSearch(query);
            },
          },
        }}
        fullWidth={true}
      />
    </Box>
  );
};

export default SQLToolbar;
