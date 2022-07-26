import React, { useState } from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { IOperation } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';

interface ITracesToolbarOperationsProps {
  instance: IPluginInstance;
  service: string;
  operation: string;
  setOperation: (operation: string) => void;
}

const TracesToolbarOperations: React.FunctionComponent<ITracesToolbarOperationsProps> = ({
  instance,
  service,
  operation,
  setOperation,
}: ITracesToolbarOperationsProps) => {
  const [show, setShow] = useState<boolean>(false);

  const { isError, isLoading, error, data } = useQuery<string[], Error>(
    ['jaeger/operations', instance, service],
    async () => {
      try {
        const response = await fetch(`/api/plugins/jaeger/operations?service=${service}`, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
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
      const filteredData = data.filter((item) => item.toLowerCase().includes(value.toLowerCase()));
      return filteredData
        .slice(0, data.length > 100 ? 100 : data.length)
        .map((item, index) => <SelectOption key={index} value={item} />);
    } else {
      if (data) {
        return data
          .slice(0, data.length > 100 ? 100 : data.length)
          .map((item, index) => <SelectOption key={index} value={item} />);
      }
      return [];
    }
  };

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
      maxHeight="50vh"
    >
      {isLoading
        ? [<SelectOption key="loading" isDisabled={true} value="Loading ..." />]
        : isError
        ? [<SelectOption key="error" isDisabled={true} value={error?.message || 'Could not get operations.'} />]
        : data
        ? data
            .slice(0, data.length > 100 ? 100 : data.length)
            .map((operation, index) => <SelectOption key={index} value={operation} />)
        : []}
    </Select>
  );
};

export default TracesToolbarOperations;
