import { APIContext, IPluginInstance, ITimes, MUIEditor, Options } from '@kobsio/core';
import { InputBaseComponentProps, Stack, TextField } from '@mui/material';
import { FormEvent, forwardRef, FunctionComponent, useContext, useEffect, useState } from 'react';

import memo from '../utils/memo';

/**
 * The `InternalEditor` component is a wrapper around our `MUIEditor` component, which allows us to use the editor
 * within a `TextField` component of MUI.
 */
const InternalEditor = forwardRef<HTMLInputElement, InputBaseComponentProps>(function InternalEditor(props, ref) {
  const { loadCompletionItems, callSubmit, value, onChange } = props;

  const handleOnChange = (value: string | undefined) => {
    if (onChange) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onChange({ target: { value: value ?? '' } });
    }
  };

  return (
    <MUIEditor
      value={value}
      onChange={handleOnChange}
      language="klogs"
      loadCompletionItems={loadCompletionItems}
      callSubmit={callSubmit}
    />
  );
});

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
   * `loadColumns` loads columns for a specific query
   * columns are stored in memory, because we want to run this request only a single time
   * we can't memoize the columns in react state,
   * because we only have a single chance to pass the loadCompletions func to the MUIEditor.
   */
  const loadCompletions = memo(() =>
    client.get<string[]>(`/api/plugins/klogs/fields?filter=content`, {
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
