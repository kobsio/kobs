import React, { useState } from 'react';
import { Select, SelectOption, SelectVariant, Spinner } from '@patternfly/react-core';
import { useQuery } from 'react-query';

interface IPageToolbarNamespacesProps {
  name: string;
  namespaces: string[];
  selectNamespace: (namespaces: string) => void;
}

const PageToolbarNamespaces: React.FunctionComponent<IPageToolbarNamespacesProps> = ({
  name,
  namespaces,
  selectNamespace,
}: IPageToolbarNamespacesProps) => {
  const [show, setShow] = useState<boolean>(false);

  const { isError, isLoading, error, data } = useQuery<string[], Error>(['kiali/namespaces', name], async () => {
    try {
      const response = await fetch(`/api/plugins/kiali/namespaces/${name}`, {
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
    >
      {isError
        ? [<SelectOption key="error" isDisabled={true} value={error?.message || 'Could not get namespaces.'} />]
        : data
        ? data.map((namespace, index) => <SelectOption key={index} value={namespace} />)
        : []}
    </Select>
  );
};

export default PageToolbarNamespaces;
