import {
  APIContext,
  IOptionsAdditionalFields,
  IPluginInstance,
  ITimes,
  Options,
  Toolbar,
  ToolbarItem,
} from '@kobsio/core';
import { TextField } from '@mui/material';
import { FunctionComponent, useContext, useEffect, useState } from 'react';

import Editor from './Editor';

import memo from '../utils/memo';
import { orderMapping } from '../utils/order';

interface ILogsToolbarProps extends ITimes {
  hideOderSelection?: boolean;
  instance: IPluginInstance;
  onChangeOrder?: (orderBy: string, order: 'asc' | 'desc') => void;
  onChangeTime: (times: ITimes) => void;
  onSearch: (query: string) => void;
  order?: 'asc' | 'desc';
  orderBy?: string;
  query: string;
}

/**
 * The `LogsToolbar` renders a text field and
 * a date selector for querying logs with the klogs plugin.
 */
const LogsToolbar: FunctionComponent<ILogsToolbarProps> = ({
  hideOderSelection,
  instance,
  onChangeTime,
  onSearch,
  onChangeOrder,
  orderBy,
  order,
  query: initialQuery,
  time,
  timeEnd,
  timeStart,
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const { client } = useContext(APIContext);

  const handleChangeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined) => {
    onChangeTime(times);
    if (additionalFields && additionalFields.length === 2) {
      const orderBy = additionalFields[0].value;
      const order = additionalFields[1].value as 'ascending' | 'descending';
      onChangeOrder && onChangeOrder(orderBy, orderMapping.longToShort[order]);
    }
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
    <Toolbar>
      <ToolbarItem grow={true}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            inputComponent: Editor,
            inputProps: {
              callSubmit: () => {
                onSearch(query);
              },
              loadCompletionItems: loadCompletions,
            },
          }}
          fullWidth={true}
        />
      </ToolbarItem>
      <ToolbarItem align="right">
        <Options
          additionalFields={
            hideOderSelection
              ? undefined
              : [
                  {
                    label: 'Order By',
                    name: 'orderBy',
                    placeholder: 'timestamp',
                    value: orderBy || '',
                  },
                  {
                    label: 'Order',
                    name: 'order',
                    placeholder: '',
                    type: 'select',
                    value: order ? orderMapping.shortToLong[order] : 'descending',
                    values: ['ascending', 'descending'],
                  },
                ]
          }
          times={{ time, timeEnd, timeStart }}
          showOptions={true}
          showSearchButton={false}
          setOptions={handleChangeOptions}
        />
      </ToolbarItem>
    </Toolbar>
  );
};

export default LogsToolbar;
