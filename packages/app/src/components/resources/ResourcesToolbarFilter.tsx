import React, { useState } from 'react';
import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  TextInput,
  ToolbarGroup,
  ToolbarGroupVariant,
  ToolbarItem,
} from '@patternfly/react-core';

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
    <ToolbarGroup variant={ToolbarGroupVariant['filter-group']}>
      <ToolbarItem>
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
      <ToolbarItem>
        <TextInput aria-label="Filter input" value={param} onChange={(value: string): void => setParam(value)} />
      </ToolbarItem>
    </ToolbarGroup>
  );
};

export default ResourcesToolbarFilter;
