import React, { useState } from 'react';
import {
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
import FilterIcon from '@patternfly/react-icons/dist/js/icons/filter-icon';

import Options, { IAdditionalFields } from 'components/Options';
import { Query } from 'proto/elasticsearch_grpc_web_pb';

// IElasticsearchPluginToolbarProps is the interface for all properties, which can be passed to the
// ElasticsearchPluginToolbar component. This are all available Elasticsearch options and a function to write changes to
// these properties back to the parent component.
interface IElasticsearchPluginToolbarProps {
  queryName: string;
  queries: Query.AsObject[];
  timeEnd: number;
  timeStart: number;
  setQuery: (name: string, query: string, fields: string[]) => void;
  setTimes: (timeEnd: number, timeStart: number) => void;
}

// ElasticsearchPluginToolbar is the toolbar for the Elasticsearch plugin page. It allows a user to specify query and to
// select a start time and end time for the query.
const ElasticsearchPluginToolbar: React.FunctionComponent<IElasticsearchPluginToolbarProps> = ({
  queryName,
  queries,
  timeEnd,
  timeStart,
  setQuery,
  setTimes,
}: IElasticsearchPluginToolbarProps) => {
  const [show, setShow] = useState<boolean>(false);

  // changeOptions is used to change the start and end time of for an query.
  const changeOptions = (
    additionalFields: IAdditionalFields[] | undefined,
    timeEnd: number,
    timeStart: number,
  ): void => {
    setTimes(timeEnd, timeStart);
  };

  // onSelect is used to change the query, when a user selects a query from the select component.
  const onSelect = (
    event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    value: string | SelectOptionObject,
  ): void => {
    const query = queries.filter((q) => q.name === value);
    if (query.length === 1) {
      setQuery(query[0].name, query[0].query, query[0].fieldsList);
      setShow(false);
    }
  };

  return (
    <Toolbar id="elasticsearch-toolbar">
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
                  <SelectOption key={index} value={query.name} description={query.query} />
                ))}
              </Select>
            </ToolbarItem>
            <ToolbarItem>
              <Options pTimeEnd={timeEnd} pTimeStart={timeStart} setValues={changeOptions} />
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default ElasticsearchPluginToolbar;
