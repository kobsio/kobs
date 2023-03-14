import { ITimes, Options } from '@kobsio/core';
import { Stack, TextField } from '@mui/material';
import { FormEvent, FunctionComponent, useEffect, useState } from 'react';

interface ILogsToolbarHandlers {
  onChangeTime: (times: ITimes) => void;
  onSearch: (query: string) => void;
}
interface ILogsToolbar extends ITimes {
  handlers: ILogsToolbarHandlers;
  query: string;
}

/**
 * The `LogsToolbar` renders a text field and
 * a date selector for querying logs with the klogs plugin.
 */
const LogsToolbar: FunctionComponent<ILogsToolbar> = ({ handlers, query: initialQuery, time, timeEnd, timeStart }) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    return handlers.onSearch(query);
  };

  const handleChangeTime = (times: ITimes) => {
    handlers.onChangeTime(times);
  };

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <Stack direction="row" component="form" onSubmit={handleSubmit} spacing={4} alignItems="center">
      <TextField
        id="query"
        name="query"
        label="Query"
        placeholder="namespace = 'kube-system'"
        onChange={(e) => {
          setQuery(e.target.value);
        }}
        value={query}
        size="small"
        sx={{ width: '100%' }}
      />
      <Options
        times={{ time, timeEnd, timeStart }}
        showOptions={true}
        showSearchButton={false}
        setOptions={handleChangeTime}
      />
    </Stack>
  );
};

export default LogsToolbar;
