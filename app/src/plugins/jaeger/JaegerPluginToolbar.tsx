import {
  Card,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { FilterIcon } from '@patternfly/react-icons';

import Options, { IAdditionalFields } from 'components/Options';
import { Query } from 'proto/jaeger_grpc_web_pb';

interface IJaegerPluginToolbarProps {
  queryName: string;
  queries: Query.AsObject[];
  limit: string;
  maxDuration: string;
  minDuration: string;
  timeEnd: number;
  timeStart: number;
  setQuery: (name: string, service: string, operation: string, tags: string) => void;
  setOptions: (limit: string, maxDuration: string, minDuration: string, timeEnd: number, timeStart: number) => void;
}

const JaegerPluginToolbar: React.FunctionComponent<IJaegerPluginToolbarProps> = ({
  queryName,
  queries,
  limit,
  maxDuration,
  minDuration,
  timeEnd,
  timeStart,
  setQuery,
  setOptions,
}: IJaegerPluginToolbarProps) => {
  const [show, setShow] = useState<boolean>(false);

  // changeAddtionalOptions changes the Jaeger options. This function is passed to the shared Options component.
  const changeAddtionalOptions = (
    additionalFields: IAdditionalFields[] | undefined,
    timeEnd: number,
    timeStart: number,
  ): void => {
    if (additionalFields && additionalFields.length === 3) {
      setOptions(additionalFields[0].value, additionalFields[1].value, additionalFields[2].value, timeEnd, timeStart);
    }
  };

  // onSelect is used to change the query, when a user selects a query from the select component.
  const onSelect = (
    event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    value: string | SelectOptionObject,
  ): void => {
    const query = queries.filter((q) => q.name === value);
    if (query.length === 1) {
      setQuery(query[0].name, query[0].service, query[0].operation, query[0].tags);
      setShow(false);
    }
  };

  return (
    <Card>
      <Toolbar id="jaeger-toolbar">
        <ToolbarContent>
          <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
            <ToolbarGroup style={{ alignItems: 'flex-start', width: '100%' }}>
              <ToolbarItem style={{ width: '100%' }}>
                <Select
                  variant={SelectVariant.single}
                  typeAheadAriaLabel={`Select query`}
                  placeholderText={`Select query`}
                  onToggle={(): void => setShow(!show)}
                  onSelect={onSelect}
                  selections={queryName}
                  isOpen={show}
                >
                  {queries.map((query, index) => (
                    <SelectOption
                      key={index}
                      value={query.name}
                      description={`${query.service}${query.operation ? `: ${query.operation}` : ''}${
                        query.tags ? ` (${query.tags})` : ''
                      }`}
                    />
                  ))}
                </Select>
              </ToolbarItem>
              <ToolbarItem>
                <Options
                  pAdditionalFields={[
                    {
                      label: 'Limit',
                      name: 'limit',
                      placeholder: '20',
                      value: limit,
                    },
                    {
                      label: 'Max Duration',
                      name: 'maxDuration',
                      placeholder: '100ms',
                      value: maxDuration,
                    },
                    {
                      label: 'Min Duration',
                      name: 'minDuration',
                      placeholder: '100ms',
                      value: minDuration,
                    },
                  ]}
                  pTimeEnd={timeEnd}
                  pTimeStart={timeStart}
                  setValues={changeAddtionalOptions}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarToggleGroup>
        </ToolbarContent>
      </Toolbar>
    </Card>
  );
};

export default JaegerPluginToolbar;
