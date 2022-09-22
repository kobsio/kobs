import {
  Button,
  ButtonVariant,
  Grid,
  GridItem,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
} from '@patternfly/react-core';
import { IQueryOptions, QueryOperationType, QueryOperationTypes } from '../../utils/interfaces';
import React, { useEffect, useState } from 'react';
import { Toolbar, ToolbarItem } from '@kobsio/shared';
import BsonInput from './BsonInput';
import BsonPreview from './BsonPreview';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import { determineOperation } from '../../utils/helpers';

interface IQueryToolbarProps {
  options: IQueryOptions;
  changeOptions: (data: IQueryOptions) => void;
  runQuery: () => void;
}

const QueryToolbar: React.FunctionComponent<IQueryToolbarProps> = ({
  options,
  changeOptions,
  runQuery,
}: IQueryToolbarProps) => {
  const [state, setState] = useState<{
    operation: QueryOperationType | undefined;
    operationDropdownIsOpen: boolean;
    query: string;
  }>({
    operation: options.operation,
    operationDropdownIsOpen: false,
    query: options.query,
  });

  const propagateOptions = (): void => {
    changeOptions({
      operation: state.operation,
      query: state.query,
    });
  };

  useEffect(propagateOptions, [changeOptions, state]);

  return (
    <Toolbar usePageInsets={true}>
      <ToolbarItem grow={true}>
        <Select
          variant={SelectVariant.single}
          aria-label="Select operation input"
          placeholderText="operation"
          onToggle={(): void => setState({ ...state, operationDropdownIsOpen: !state.operationDropdownIsOpen })}
          onSelect={(
            event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
            value: string | SelectOptionObject,
          ): void =>
            setState({ ...state, operation: determineOperation(value.toString()), operationDropdownIsOpen: false })
          }
          onClear={(): void => setState({ ...state, operation: undefined })}
          selections={state.operation}
          isOpen={state.operationDropdownIsOpen}
          maxHeight="50vh"
        >
          {Object.keys(QueryOperationTypes).map((operation: string) => (
            <SelectOption key={operation} value={operation} />
          ))}
        </Select>
        {(state.operation === QueryOperationTypes.find || state.operation === QueryOperationTypes.count) && (
          <Grid hasGutter={true}>
            <GridItem span={7}>
              <span>Query:</span>
              <BsonInput
                data={state.query}
                onInputChange={(newDocument: string): void => {
                  setState({ ...state, query: newDocument });
                }}
              ></BsonInput>
            </GridItem>
            <GridItem span={5}>
              <span>Rendered Query:</span>
              <BsonPreview data={state.query} />
            </GridItem>
          </Grid>
        )}
        <Button variant={ButtonVariant.primary} icon={<SearchIcon />} onClick={runQuery}>
          Query
        </Button>
      </ToolbarItem>
    </Toolbar>
  );
};

export default QueryToolbar;
