import {
  ActionGroup,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  TextInput,
} from '@patternfly/react-core';
import React, { useState } from 'react';

import { IQueryOptions, TQueryOperation } from '../../utils/interfaces';
import { Toolbar, ToolbarItem } from '@kobsio/shared';
import BsonInput from './BsonInput';
import { queryOperations } from '../../utils/helpers';

interface IQueryPageToolbarProps {
  options: IQueryOptions;
  setOptions: (data: IQueryOptions) => void;
}

const QueryPageToolbar: React.FunctionComponent<IQueryPageToolbarProps> = ({
  options,
  setOptions,
}: IQueryPageToolbarProps) => {
  const [state, setState] = useState<IQueryOptions>({
    limit: options.limit,
    operation: options.operation,
    query: options.query,
    sort: options.sort,
  });

  const changeOptions = (): void => {
    setOptions({ limit: state.limit, operation: state.operation, query: state.query, sort: state.sort });
  };

  return (
    <Toolbar usePageInsets={true}>
      <ToolbarItem grow={true}>
        <Form isHorizontal={true}>
          <FormGroup label="Operation" fieldId="operation">
            <FormSelect
              value={state.operation}
              onChange={(value: string): void => setState({ ...state, operation: value as TQueryOperation })}
              id="operation"
              name="operation"
              aria-label="Operation"
            >
              {queryOperations.map((operation) => (
                <FormSelectOption key={operation} value={operation} label={operation} />
              ))}
            </FormSelect>
          </FormGroup>

          <FormGroup label="Query" fieldId="query">
            <BsonInput
              data={state.query}
              onInputChange={(value: string): void => {
                setState({ ...state, query: value });
              }}
            />
          </FormGroup>

          {state.operation === 'find' && (
            <FormGroup label="Limit" fieldId="limit">
              <TextInput
                value={state.limit}
                type="number"
                id="limit"
                name="limit"
                onChange={(value: string): void => {
                  setState({ ...state, limit: value });
                }}
              />
            </FormGroup>
          )}

          {state.operation === 'find' && (
            <FormGroup label="Sort" fieldId="sort">
              <BsonInput
                data={state.sort}
                onInputChange={(value: string): void => {
                  setState({ ...state, sort: value });
                }}
              />
            </FormGroup>
          )}
          <ActionGroup>
            <Button variant={ButtonVariant.primary} onClick={changeOptions}>
              Query
            </Button>
          </ActionGroup>
        </Form>
      </ToolbarItem>
    </Toolbar>
  );
};

export default QueryPageToolbar;
