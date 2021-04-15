import {
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  InputGroup,
  // TextArea,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, MinusIcon, PlusIcon, SearchIcon } from '@patternfly/react-icons';
import React, { useState } from 'react';

import Options, { IAdditionalFields } from 'components/Options';
import { Autocomplete } from '../../components/Autocomplete';
import { IPrometheusOptions } from 'plugins/prometheus/helpers';

// IPrometheusPageToolbarProps is the interface for all properties, which can be passed to the PrometheusPageToolbar
// component. This are all available Prometheus options and a function to write changes to these properties back to the
// parent component.
interface IPrometheusPageToolbarProps extends IPrometheusOptions {
  setOptions: (data: IPrometheusOptions) => void;
}

// PrometheusPageToolbar is the toolbar for the Prometheus plugin page. It allows a user to specify query and to select
// a start time, end time and resolution for the query.
const PrometheusPageToolbar: React.FunctionComponent<IPrometheusPageToolbarProps> = ({
  queries,
  resolution,
  timeEnd,
  timeStart,
  setOptions,
}: IPrometheusPageToolbarProps) => {
  const [data, setData] = useState<IPrometheusOptions>({
    queries: queries,
    resolution: resolution,
    timeEnd: timeEnd,
    timeStart: timeStart,
  });

  const addQuery = (): void => {
    const tmpQueries = [...data.queries];
    tmpQueries.push('');
    setData({ ...data, queries: tmpQueries });
  };

  const removeQuery = (index: number): void => {
    const tmpQueries = [...data.queries];
    tmpQueries.splice(index, 1);
    setData({ ...data, queries: tmpQueries });
  };

  // changeQuery changes the value of a single query.
  // const changeQuery = (index: number, value: string): void => {
  //   const tmpQueries = [...data.queries];
  //   tmpQueries[index] = value;
  //   setData({ ...data, queries: tmpQueries });
  // };

  // changeOptions changes the Prometheus options. This function is passed to the shared Options component.
  const changeOptions = (
    additionalFields: IAdditionalFields[] | undefined,
    timeEnd: number,
    timeStart: number,
  ): void => {
    if (additionalFields && additionalFields.length === 1) {
      setData({
        ...data,
        resolution: additionalFields[0].value,
        timeEnd: timeEnd,
        timeStart: timeStart,
      });
    }
  };

  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we will not add a newline.
  // Instead of this we are calling the setOptions function to trigger the search. To enter a newline the user has to
  // use "SHIFT" + "ENTER".
  // const onEnter = (e: React.KeyboardEvent<HTMLTextAreaElement> | undefined): void => {
  //   if (e?.key === 'Enter' && !e.shiftKey) {
  //     e.preventDefault();
  //     setOptions(data);
  //   }
  // };

  return (
    <Toolbar id="prometheus-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup style={{ alignItems: 'flex-start', width: '100%' }}>
            <ToolbarItem style={{ width: '100%' }}>
              <Flex style={{ width: '100%' }} direction={{ default: 'column' }} grow={{ default: 'grow' }}>
                {data.queries.map((query, index) => (
                  <FlexItem key={index}>
                    <InputGroup>
                      <Autocomplete />
                      {/*<TextArea*/}
                      {/*  aria-label={`PromQL Query ${index}`}*/}
                      {/*  resizeOrientation="vertical"*/}
                      {/*  rows={1}*/}
                      {/*  type="text"*/}
                      {/*  value={query}*/}
                      {/*  onChange={(value): void => changeQuery(index, value)}*/}
                      {/*  onKeyDown={onEnter}*/}
                      {/*/>*/}
                      {index === 0 ? (
                        <Button variant={ButtonVariant.control} onClick={addQuery}>
                          <PlusIcon />
                        </Button>
                      ) : (
                        <Button variant={ButtonVariant.control} onClick={(): void => removeQuery(index)}>
                          <MinusIcon />
                        </Button>
                      )}
                    </InputGroup>
                  </FlexItem>
                ))}
              </Flex>
            </ToolbarItem>
            <ToolbarItem>
              <Options
                pAdditionalFields={[
                  {
                    label: 'Resolution',
                    name: 'resolution',
                    placeholder: '1m',
                    value: data.resolution,
                  },
                ]}
                pTimeEnd={data.timeEnd}
                pTimeStart={data.timeStart}
                setValues={changeOptions}
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

export default PrometheusPageToolbar;
