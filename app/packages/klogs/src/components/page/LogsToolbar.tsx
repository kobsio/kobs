import { Completion, autocompletion, completeFromList } from '@codemirror/autocomplete';
import {
  APIContext,
  APIError,
  Editor,
  IAPIContext,
  IOptionsAdditionalFields,
  IPluginInstance,
  ITimes,
  Options,
  Toolbar,
  ToolbarItem,
} from '@kobsio/core';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useEffect, useState } from 'react';

import { orderMapping } from '../utils/order';

export interface IOptions extends ITimes {
  order?: 'asc' | 'desc';
  orderBy?: string;
}

interface ILogsToolbarProps extends IOptions {
  hideOderSelection?: boolean;
  instance: IPluginInstance;
  onChangeOptions: (options: IOptions) => void;
  onSearch: (query: string) => void;
  query: string;
}

/**
 * The `LogsToolbar` renders a text field and
 * a date selector for querying logs with the klogs plugin.
 */
const LogsToolbar: FunctionComponent<ILogsToolbarProps> = ({
  hideOderSelection,
  instance,
  onChangeOptions,
  onSearch,
  orderBy,
  order,
  query: initialQuery,
  time,
  timeEnd,
  timeStart,
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const apiContext = useContext<IAPIContext>(APIContext);

  const { data } = useQuery<Completion[], APIError>(['klogs/fields', instance], async () => {
    const defaultCompletions: Completion[] = [
      { info: 'equals', label: '=', type: 'keyword' },
      { info: 'not equals', label: '!=', type: 'keyword' },
      { info: 'smaller', label: '<', type: 'keyword' },
      { info: 'smaller or equal', label: '<=', type: 'keyword' },
      { info: 'greater', label: '>', type: 'keyword' },
      { info: 'greater or equal', label: '>=', type: 'keyword' },
      { info: 'ILIKE', label: '=~', type: 'keyword' },
      { info: 'not ILIKE', label: '!~', type: 'keyword' },
      { info: 'regex match', label: '~', type: 'keyword' },

      { info: 'and statement', label: '_and_', type: 'keyword' },
      { info: 'or statement', label: '_or_', type: 'keyword' },
      { info: 'not statement', label: '_not_', type: 'keyword' },
      { info: 'exists statement', label: '_exists_', type: 'keyword' },
    ];

    try {
      const fields = await apiContext.client.get<string[]>(`/api/plugins/klogs/fields`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
      return [
        ...defaultCompletions,
        ...fields.filter((field) => !field.includes(' ')).map((field) => ({ label: field, type: 'keyword' })),
      ];
    } catch {
      return defaultCompletions;
    }
  });

  const handleChangeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined) => {
    const options: IOptions = { ...times };
    if (additionalFields && additionalFields.length === 2) {
      options.orderBy = additionalFields[0].value;
      options.order = orderMapping.longToShort[additionalFields[1].value as 'ascending' | 'descending'];
    }
    onChangeOptions(options);
  };

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <Toolbar>
      <ToolbarItem grow={true}>
        {data && (
          <Editor
            language={[
              autocompletion({
                override: [completeFromList(data)],
              }),
            ]}
            minimal={true}
            value={query}
            onChange={(value) => setQuery(value)}
            handleSubmit={() => {
              onSearch(query);
            }}
          />
        )}
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
