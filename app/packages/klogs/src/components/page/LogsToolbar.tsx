import { APIContext, IPluginInstance, ITimes, Options } from '@kobsio/core';
import { Stack, TextField } from '@mui/material';
import { FormEvent, FunctionComponent, useContext, useEffect, useState } from 'react';

import InternalEditor from './InternalEditor';

import memo from '../utils/memo';

interface ILogsToolbarHandlers {
  onChangeTime: (times: ITimes) => void;
  onSearch: (query: string) => void;
}
interface ILogsToolbar extends ITimes {
  handlers: ILogsToolbarHandlers;
  instance: IPluginInstance;
  query: string;
}

/**
 * The `LogsToolbar` renders a text field and
 * a date selector for querying logs with the klogs plugin.
 */
const LogsToolbar: FunctionComponent<ILogsToolbar> = ({
  handlers,
  instance,
  query: initialQuery,
  time,
  timeEnd,
  timeStart,
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const { client } = useContext(APIContext);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    return handlers.onSearch(query);
  };

  const handleChangeTime = (times: ITimes) => {
    handlers.onChangeTime(times);
  };

  /**
   * `loadCompletions` loads the column names for autocompletion purposes
   * columns are stored in memory, because we want to run this request only once per page load.
   * columns can't be memoized in react state (useQuery or useState),
   * because we only have a single chance to pass the loadCompletions func to the MUIEditor.
   */
  const loadCompletions = memo(() =>
    client.get<string[]>(`/api/plugins/klogs/fields`, {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    }),
  );

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <Stack direction="row" component="form" onSubmit={handleSubmit} spacing={4} alignItems="center">
      <TextField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          inputComponent: InternalEditor,
          inputProps: {
            callSubmit: () => {
              handlers.onSearch(query);
            },
            loadCompletionItems: loadCompletions,
          },
        }}
        fullWidth={true}
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
