import React, { useState } from 'react';
import { Select, SelectGroup, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';

import { IVariableValues } from '../../utils/interfaces';

interface IDashboardToolbarVariableProps {
  variable: IVariableValues;
  selectValue: (value: string) => void;
}

// The DashboardToolbarVariable component is used to render a single variable in the dashboards toolbar. The select box
// contains all the values for a variable. To save some space in the toolbar we do not render the variable label/name
// in the toolbar. Instead of this we are using a select group with the label/name of the variable as title.
const DashboardToolbarVariable: React.FunctionComponent<IDashboardToolbarVariableProps> = ({
  variable,
  selectValue,
}: IDashboardToolbarVariableProps) => {
  const [show, setShow] = useState<boolean>(false);

  // onSelect is called, when the user selects a value for a variable. In this case we change the variable value and we
  // close the select box.
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

  // group is the select group for the select box. We can not render this in the return function, because the Select
  // component requires an array of SelectGroup components.
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
