import {
  Button,
  ButtonVariant,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import React, { useState } from 'react';

import { IOptionsAdditionalFields, Options, TTime } from '@kobsio/plugin-core';
import { IOptions } from '../../utils/interfaces';

interface IPageToolbarProps extends IOptions {
  name: string;
  setOptions: (data: IOptions) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({
  name,
  query,
  type,
  times,
  setOptions,
}: IPageToolbarProps) => {
  const [data, setData] = useState<IOptions>({
    query: query,
    times: times,
    type: type,
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
      setOptions(data);
    }
  };

  const changeOptions = (
    refresh: boolean,
    additionalFields: IOptionsAdditionalFields[] | undefined,
    time: TTime,
    timeEnd: number,
    timeStart: number,
  ): void => {
    const tmpData = { ...data };

    if (refresh) {
      setOptions({
        ...tmpData,
        times: { time: time, timeEnd: timeEnd, timeStart: timeStart },
      });
    }

    setData({
      ...tmpData,
      times: { time: time, timeEnd: timeEnd, timeStart: timeStart },
    });
  };

  return (
    <Toolbar id="jaeger-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup style={{ width: '100%' }}>
            <ToolbarItem style={{ width: '100%' }}>
              <TextInput aria-label="Query" type="text" value={data.query} onChange={changeQuery} onKeyDown={onEnter} />
            </ToolbarItem>
            <ToolbarItem>
              <ToggleGroup aria-label="View">
                <ToggleGroupItem
                  text="Alerts"
                  isSelected={data.type === 'alerts'}
                  onChange={(): void => setData({ ...data, type: 'alerts' })}
                />
                <ToggleGroupItem
                  text="Incidents"
                  isSelected={data.type === 'incidents'}
                  onChange={(): void => setData({ ...data, type: 'incidents' })}
                />
              </ToggleGroup>
            </ToolbarItem>
            <ToolbarItem>
              <Options
                time={data.times.time}
                timeEnd={data.times.timeEnd}
                timeStart={data.times.timeStart}
                setOptions={changeOptions}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button variant={ButtonVariant.primary} icon={<SearchIcon />} onClick={(): void => setOptions(data)}>
                Search
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default PageToolbar;
