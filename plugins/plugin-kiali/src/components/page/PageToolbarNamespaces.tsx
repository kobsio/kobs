import React, { useState } from 'react';
import { Select, SelectOption, SelectVariant, Spinner } from '@patternfly/react-core';
import { IPluginInstance } from '@kobsio/shared';
import { useQuery } from 'react-query';

interface IPageToolbarNamespacesProps {
  instance: IPluginInstance;
  namespaces: string[];
  selectNamespace: (namespaces: string) => void;
}

const PageToolbarNamespaces: React.FunctionComponent<IPageToolbarNamespacesProps> = ({
  instance,
  namespaces,
  selectNamespace,
}: IPageToolbarNamespacesProps) => {
  const [show, setShow] = useState<boolean>(false);

  const { isError, isLoading, error, data } = useQuery<string[], Error>(['kiali/namespaces', instance], async () => {
    try {
      const response = await fetch(`/api/plugins/kiali/namespaces`, {
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
        return json;
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

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <Select
      variant={SelectVariant.typeaheadMulti}
      typeAheadAriaLabel="Namespaces"
      placeholderText="Namespaces"
      onToggle={(): void => setShow(!show)}
      onSelect={(e, value): void => selectNamespace(value as string)}
      onClear={(): void => selectNamespace('')}
      selections={namespaces}
      isOpen={show}
      onFilter={(e: React.ChangeEvent<HTMLInputElement> | null, value: string): React.ReactElement[] =>
        data
          ? data
              .filter((ns) => !value || ns.includes(value))
              .map((namespace: string) => <SelectOption key={namespace} value={namespace} />)
          : []
      }
    >
      {isError
        ? [<SelectOption key="error" isDisabled={true} value={error?.message || 'Could not get namespaces.'} />]
        : data
        ? data.map((namespace) => <SelectOption key={namespace} value={namespace} />)
        : []}
    </Select>
  );
};

export default PageToolbarNamespaces;
