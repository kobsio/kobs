import {
  Button,
  ButtonVariant,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import React, { useEffect, useState } from 'react';

import { IOptionsAdditionalFields, Options, TTime } from '@kobsio/plugin-core';
import { IOptions } from '../../utils/interfaces';

interface ILogsToolbarProps extends IOptions {
  setOptions: (data: IOptions) => void;
}

const LogsToolbar: React.FunctionComponent<ILogsToolbarProps> = ({
  query,
  order,
  orderBy,
  fields,
  times,
  setOptions,
}: ILogsToolbarProps) => {
  const [data, setData] = useState<IOptions>({
    order: order,
    orderBy: orderBy,
    query: query,
    times: times,
  });

  // changeQuery changes the value of a query.
  const changeQuery = (value: string): void => {
    setData({ ...data, query: value });
  };

  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we are calling the setOptions
  // function to trigger the search.
  // use "SHIFT" + "ENTER".
  const onEnter = (e: React.KeyboardEvent<HTMLInputElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      setOptions({ ...data, fields: fields });
    }
  };

  // changeOptions changes the Elasticsearch option. If the options are changed via the refresh button of the Options
  // component we directly modify the options of the parent component, if not we only change the data of the toolbar
  // component and the user can trigger an action via the search button.
  const changeOptions = (
    refresh: boolean,
    additionalFields: IOptionsAdditionalFields[] | undefined,
    time: TTime,
    timeEnd: number,
    timeStart: number,
  ): void => {
    if (additionalFields && additionalFields.length === 2) {
      const tmpData = { ...data };

      if (refresh) {
        setOptions({
          ...tmpData,
          fields: fields,
          order: additionalFields[1].value,
          orderBy: additionalFields[0].value,
          times: { time: time, timeEnd: timeEnd, timeStart: timeStart },
        });
      }

      setData({
        ...tmpData,
        order: additionalFields[1].value,
        orderBy: additionalFields[0].value,
        times: { time: time, timeEnd: timeEnd, timeStart: timeStart },
      });
    }
  };

  useEffect(() => {
    setData({ ...data, query: query });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <Toolbar id="clickhouse-logs-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup style={{ alignItems: 'flex-start', width: '100%' }}>
            <ToolbarItem style={{ width: '100%' }}>
              <TextInput aria-label="Query" type="text" value={data.query} onChange={changeQuery} onKeyDown={onEnter} />
            </ToolbarItem>
            <ToolbarItem>
              <Options
                additionalFields={[
                  {
                    label: 'Order By',
                    name: 'orderBy',
                    placeholder: 'timestamp',
                    value: data.orderBy,
                  },
                  {
                    label: 'Order',
                    name: 'order',
                    placeholder: '',
                    type: 'select',
                    value: data.order,
                    values: ['ascending', 'descending'],
                  },
                ]}
                time={data.times.time}
                timeEnd={data.times.timeEnd}
                timeStart={data.times.timeStart}
                setOptions={changeOptions}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button
                variant={ButtonVariant.primary}
                icon={<SearchIcon />}
                onClick={(): void => setOptions({ ...data, fields: fields })}
              >
                Search
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default LogsToolbar;
