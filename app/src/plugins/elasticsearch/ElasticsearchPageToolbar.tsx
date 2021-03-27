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
import React, { useState } from 'react';
import FilterIcon from '@patternfly/react-icons/dist/js/icons/filter-icon';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';

import Options, { IAdditionalFields } from 'components/Options';
import { IElasticsearchOptions } from 'plugins/elasticsearch/helpers';

// IElasticsearchPageToolbarProps is the interface for all properties, which can be passed to the
// ElasticsearchPageToolbar component. This are all available Elasticsearch options and a function to write changes to
// these properties back to the parent component.
interface IElasticsearchPageToolbarProps extends IElasticsearchOptions {
  setOptions: (data: IElasticsearchOptions) => void;
}

// ElasticsearchPageToolbar is the toolbar for the Elasticsearch plugin page. It allows a user to specify query and to
// select a start time and end time for the query.
const ElasticsearchPageToolbar: React.FunctionComponent<IElasticsearchPageToolbarProps> = ({
  query,
  queryName,
  timeEnd,
  timeStart,
  setOptions,
}: IElasticsearchPageToolbarProps) => {
  const [data, setData] = useState<IElasticsearchOptions>({
    query: query,
    queryName: queryName,
    timeEnd: timeEnd,
    timeStart: timeStart,
  });

  // changeQuery changes the value of a query.
  const changeQuery = (value: string): void => {
    setData({ ...data, query: value });
  };

  // changeOptions changes the Elasticsearch options. This function is passed to the shared Options component.
  const changeOptions = (
    additionalFields: IAdditionalFields[] | undefined,
    timeEnd: number,
    timeStart: number,
  ): void => {
    setData({
      ...data,
      timeEnd: timeEnd,
      timeStart: timeStart,
    });
  };

  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we are calling the setOptions
  // function to trigger the search.
  // use "SHIFT" + "ENTER".
  const onEnter = (e: React.KeyboardEvent<HTMLInputElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      setOptions(data);
    }
  };

  return (
    <Toolbar id="elasticsearch-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup style={{ alignItems: 'flex-start', width: '100%' }}>
            <ToolbarItem style={{ width: '100%' }}>
              <TextInput aria-label="Query" type="text" value={data.query} onChange={changeQuery} onKeyDown={onEnter} />
            </ToolbarItem>
            <ToolbarItem>
              <Options pTimeEnd={data.timeEnd} pTimeStart={data.timeStart} setValues={changeOptions} />
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

export default ElasticsearchPageToolbar;
