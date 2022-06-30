import React, { useState } from 'react';
import { Select, SelectOption, SelectOptionObject, SelectVariant, TextInput } from '@patternfly/react-core';

import { ToolbarItem } from '@kobsio/shared';

interface IResourcesToolbarFilterProps {
  paramName: string;
  param: string;
  setParamName: (paramName: string) => void;
  setParam: (param: string) => void;
}

const ResourcesToolbarFilter: React.FunctionComponent<IResourcesToolbarFilterProps> = ({
  paramName,
  param,
  setParamName,
  setParam,
}: IResourcesToolbarFilterProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <React.Fragment>
      <ToolbarItem width="100px">
        <Select
          variant={SelectVariant.single}
          aria-label="Select filter type input"
          placeholderText="Filter"
          onToggle={(): void => setIsOpen(!isOpen)}
          onSelect={(
            event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
            value: string | SelectOptionObject,
          ): void => setParamName(value.toString())}
          onClear={(): void => setParamName('')}
          selections={paramName}
          isOpen={isOpen}
          maxHeight="50vh"
        >
          <SelectOption key="labelSelector" value="labelSelector">
            Label Selector
          </SelectOption>
          <SelectOption key="fieldSelector" value="fieldSelector">
            Field Selector
          </SelectOption>
        </Select>
      </ToolbarItem>

      <ToolbarItem width="150px">
        <TextInput
          aria-label="Filter input"
          placeholder="Filter value"
          value={param}
          onChange={(value: string): void => setParam(value)}
        />
      </ToolbarItem>
    </React.Fragment>
  );
};

export default ResourcesToolbarFilter;
