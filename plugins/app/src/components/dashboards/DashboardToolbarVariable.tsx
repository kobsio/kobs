import React, { useState } from 'react';
import { Select, SelectGroup, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';

import { IVariableValues } from '../../crds/dashboard';

interface IDashboardToolbarVariableProps {
  variable: IVariableValues;
  selectValue: (value: string) => void;
}

const DashboardToolbarVariable: React.FunctionComponent<IDashboardToolbarVariableProps> = ({
  variable,
  selectValue,
}: IDashboardToolbarVariableProps) => {
  const [show, setShow] = useState<boolean>(false);

  const onSelect = (
    event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    value: string | SelectOptionObject,
  ): void => {
    selectValue(value as string);
    setShow(false);
  };

  const filter = (
    e: React.ChangeEvent<HTMLInputElement> | null,
    value: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): React.ReactElement<any, string | React.JSXElementConstructor<any>>[] => {
    if (value) {
      return [
        <SelectGroup label={variable.label || variable.name} key="variable">
          {variable.values
            .filter((item) => item.includes(value))
            .map((item, index) => (
              <SelectOption key={index} value={item} />
            ))}
        </SelectGroup>,
      ];
    } else {
      return [
        <SelectGroup label={variable.label || variable.name} key="variable">
          {variable.values.map((item, index) => (
            <SelectOption key={index} value={item} />
          ))}
        </SelectGroup>,
      ];
    }
  };

  const group = [
    <SelectGroup label={variable.label || variable.name} key="variable">
      {variable.values.map((value) => (
        <SelectOption key={value} value={value} />
      ))}
    </SelectGroup>,
  ];

  return (
    <Select
      variant={SelectVariant.typeahead}
      typeAheadAriaLabel={`Select ${variable.label || variable.name}`}
      placeholderText={`Select ${variable.label || variable.name}`}
      onToggle={(): void => setShow(!show)}
      onFilter={filter}
      onSelect={onSelect}
      selections={variable.value}
      isOpen={show}
      isGrouped={true}
      width={250}
    >
      {group}
    </Select>
  );
};

export default DashboardToolbarVariable;
