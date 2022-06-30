import { Button, ButtonVariant, Flex, FlexItem, InputGroup } from '@patternfly/react-core';
import { MinusIcon, PlusIcon } from '@patternfly/react-icons';
import React, { useState } from 'react';

import { IOptionsAdditionalFields, IPluginInstance, ITimes, Options, Toolbar, ToolbarItem } from '@kobsio/shared';
import { IOptions } from '../../utils/interfaces';
import PageToolbarAutocomplete from './PageToolbarAutocomplete';

// IPageToolbarProps is the interface for all properties, which can be passed to the PageToolbar component. This are all
// available Prometheus options and a function to write changes to these properties back to the parent component.
interface IPageToolbarProps {
  instance: IPluginInstance;
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

// PageToolbar is the toolbar for the Prometheus plugin page. It allows a user to specify query and to select a start
// time, end time and resolution for the query.
const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({
  instance,
  options,
  setOptions,
}: IPageToolbarProps) => {
  const [queries, setQueries] = useState<string[]>(options.queries);

  const addQuery = (): void => {
    const q = [...queries];
    q.push('');
    setQueries(q);
  };

  const removeQuery = (index: number): void => {
    const tmpQueries = [...queries];
    tmpQueries.splice(index, 1);
    setQueries(tmpQueries);
  };

  // changeQuery changes the value of a single query.
  const changeQuery = (index: number, value: string): void => {
    const tmpQueries = [...queries];
    tmpQueries[index] = value;
    setQueries(tmpQueries);
  };

  // changeOptions changes the Prometheus option. It is used when the user clicks the search button or selects a new
  // time range.
  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    if (additionalFields && additionalFields.length === 1) {
      setOptions({ queries: queries, resolution: additionalFields[0].value, times: times });
    }
  };

  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we will not add a newline.
  // Instead of this we are calling the setOptions function to trigger the search. To enter a newline the user has to
  // use "SHIFT" + "ENTER".
  const onEnter = (e: React.KeyboardEvent<HTMLTextAreaElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setOptions({ ...options, queries: queries });
    }
  };

  return (
    <Toolbar usePageInsets={true}>
      <ToolbarItem grow={true}>
        <Flex style={{ width: '100%' }} direction={{ default: 'column' }} grow={{ default: 'grow' }}>
          {queries.map((query, index) => (
            <FlexItem key={index}>
              <InputGroup>
                <PageToolbarAutocomplete
                  instance={instance}
                  query={query}
                  setQuery={(value): void => changeQuery(index, value)}
                  onEnter={onEnter}
                />
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

      <Options
        times={options.times}
        additionalFields={[
          {
            label: 'Resolution',
            name: 'resolution',
            placeholder: '1m',
            value: options.resolution,
          },
        ]}
        showOptions={true}
        showSearchButton={true}
        setOptions={changeOptions}
      />
    </Toolbar>
  );
};

export default PageToolbar;
