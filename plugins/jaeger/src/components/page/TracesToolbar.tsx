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
import React, { useState } from 'react';

import { IOptionsAdditionalFields, Options, TTime } from '@kobsio/plugin-core';
import { IOptions } from '../../utils/interfaces';
import TracesToolbarOperations from './TracesToolbarOperations';
import TracesToolbarServices from './TracesToolbarServices';

interface ITracesToolbarProps extends IOptions {
  name: string;
  setOptions: (data: IOptions) => void;
}

const TracesToolbar: React.FunctionComponent<ITracesToolbarProps> = ({
  name,
  limit,
  maxDuration,
  minDuration,
  operation,
  service,
  tags,
  times,
  setOptions,
}: ITracesToolbarProps) => {
  const [data, setData] = useState<IOptions>({
    limit: limit,
    maxDuration: maxDuration,
    minDuration: minDuration,
    operation: operation === '' ? 'All Operations' : operation,
    service: service,
    tags: tags,
    times: times,
  });

  const changeOptions = (
    refresh: boolean,
    additionalFields: IOptionsAdditionalFields[] | undefined,
    time: TTime,
    timeEnd: number,
    timeStart: number,
  ): void => {
    if (additionalFields && additionalFields.length === 3) {
      const tmpData = { ...data };

      if (refresh) {
        setOptions({
          ...tmpData,
          limit: additionalFields[0].value,
          maxDuration: additionalFields[1].value,
          minDuration: additionalFields[2].value,
          times: { time: time, timeEnd: timeEnd, timeStart: timeStart },
        });
      }

      setData({
        ...tmpData,
        limit: additionalFields[0].value,
        maxDuration: additionalFields[1].value,
        minDuration: additionalFields[2].value,
        times: { time: time, timeEnd: timeEnd, timeStart: timeStart },
      });
    }
  };

  return (
    <Toolbar id="jaeger-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup style={{ width: '100%' }}>
            <ToolbarItem style={{ width: '100%' }}>
              <TracesToolbarServices
                name={name}
                service={data.service}
                setService={(value): void => setData({ ...data, service: value })}
              />
            </ToolbarItem>
            <ToolbarItem style={{ width: '100%' }}>
              {data.service ? (
                <TracesToolbarOperations
                  name={name}
                  service={data.service}
                  operation={data.operation}
                  setOperation={(value): void => setData({ ...data, operation: value })}
                />
              ) : null}
            </ToolbarItem>
            <ToolbarItem variant="label">Tags</ToolbarItem>
            <ToolbarItem style={{ width: '100%' }}>
              <TextInput
                aria-label="Tags"
                placeholder="http.status_code=200 error=true"
                type="text"
                value={data.tags}
                onChange={(value: string): void => setData({ ...data, tags: value })}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Options
                additionalFields={[
                  {
                    label: 'Limit',
                    name: 'limit',
                    placeholder: '20',
                    value: data.limit,
                  },
                  {
                    label: 'Max Duration',
                    name: 'maxDuration',
                    placeholder: '100ms',
                    value: data.maxDuration,
                  },
                  {
                    label: 'Min Duration',
                    name: 'minDuration',
                    placeholder: '100ms',
                    value: data.minDuration,
                  },
                ]}
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

export default TracesToolbar;
