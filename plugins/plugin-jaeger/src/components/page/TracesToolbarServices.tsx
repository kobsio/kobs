import React, { useState } from 'react';
import { Select, SelectOption, SelectVariant, Spinner } from '@patternfly/react-core';
import { useQuery } from 'react-query';

import { IPluginInstance } from '@kobsio/shared';

interface ITracesToolbarServicesProps {
  instance: IPluginInstance;
  service: string;
  setService: (service: string) => void;
}

const TracesToolbarServices: React.FunctionComponent<ITracesToolbarServicesProps> = ({
  instance,
  service,
  setService,
}: ITracesToolbarServicesProps) => {
  const [show, setShow] = useState<boolean>(false);

  const { isError, isLoading, error, data } = useQuery<string[], Error>(['jaeger/services', instance], async () => {
    try {
      const response = await fetch(`/api/plugins/jaeger/services`, {
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
        return json.data.sort();
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
  });

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
      typeAheadAriaLabel="Services"
      placeholderText="Services"
      onToggle={(): void => setShow(!show)}
      onFilter={isError ? undefined : filter}
      onSelect={(e, value): void => setService(value as string)}
      selections={service}
      isOpen={show}
    >
      {isError
        ? [<SelectOption key="error" isDisabled={true} value={error?.message || 'Could not get services.'} />]
        : data
        ? data
            .slice(0, data.length > 50 ? 50 : data.length)
            .map((service, index) => <SelectOption key={index} value={service} />)
        : []}
    </Select>
  );
};

export default TracesToolbarServices;
