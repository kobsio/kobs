import React, { useState } from 'react';
import { Select, SelectOption, SelectVariant, Spinner } from '@patternfly/react-core';
import { useQuery } from 'react-query';

import { IOperation } from '../../utils/interfaces';

interface ITracesToolbarOperationsProps {
  name: string;
  service: string;
  operation: string;
  setOperation: (operation: string) => void;
}

const TracesToolbarOperations: React.FunctionComponent<ITracesToolbarOperationsProps> = ({
  name,
  service,
  operation,
  setOperation,
}: ITracesToolbarOperationsProps) => {
  const [show, setShow] = useState<boolean>(false);

  const { isError, isLoading, error, data } = useQuery<string[], Error>(
    ['jaeger/operations', name, service],
    async () => {
      try {
        const response = await fetch(`/api/plugins/jaeger/${name}/operations?service=${service}`, {
          method: 'get',
        });
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return ['All Operations', ...json.data.map((operation: IOperation) => operation.name).sort()];
        } else {
          if (json.error) {
            throw new Error(json.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  const filter = (
    e: React.ChangeEvent<HTMLInputElement> | null,
    value: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): React.ReactElement<any, string | React.JSXElementConstructor<any>>[] => {
    if (value && data) {
      return data
        .filter((item) => item.toLowerCase().includes(value.toLowerCase()))
        .map((item, index) => <SelectOption key={index} value={item} />);
    } else {
      if (data) {
        return data.map((item, index) => <SelectOption key={index} value={item} />);
      }
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <Select
      variant={SelectVariant.typeahead}
      typeAheadAriaLabel="Operations"
      placeholderText="Operations"
      onToggle={(): void => setShow(!show)}
      onFilter={isError ? undefined : filter}
      onSelect={(e, value): void => setOperation(value as string)}
      selections={operation}
      isOpen={show}
    >
      {isError
        ? [<SelectOption key="error" isDisabled={true} value={error?.message || 'Could not get operations.'} />]
        : data
        ? data
            .slice(0, data.length > 50 ? 50 : data.length)
            .map((operation, index) => <SelectOption key={index} value={operation} />)
        : []}
    </Select>
  );
};

export default TracesToolbarOperations;
