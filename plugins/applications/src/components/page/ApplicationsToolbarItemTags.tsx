import React, { useState } from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import { useQuery } from 'react-query';

interface IToolbarItemTagsProps {
  selectedTags: string[];
  selectTag: (tag: string) => void;
}

const ToolbarItemTags: React.FunctionComponent<IToolbarItemTagsProps> = ({
  selectedTags,
  selectTag,
}: IToolbarItemTagsProps) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);

  const { isError, error, data } = useQuery<string[], Error>(['applications/tags'], async () => {
    try {
      const response = await fetch(`/api/plugins/applications/tags`, {
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

  return (
    <Select
      variant={SelectVariant.typeaheadMulti}
      typeAheadAriaLabel="Select tags"
      placeholderText="Select tags"
      onToggle={(): void => setShowOptions(!showOptions)}
      onSelect={(e, value): void => selectTag(value as string)}
      onClear={(): void => selectTag('')}
      selections={selectedTags}
      isOpen={showOptions}
      onFilter={(e: React.ChangeEvent<HTMLInputElement> | null, value: string): React.ReactElement[] =>
        data
          ? data
              .filter((tag) => !value || tag.includes(value))
              .map((tag: string) => <SelectOption key={tag} value={tag} />)
          : []
      }
    >
      {isError
        ? [<SelectOption key="error" isDisabled={true} value={error?.message || 'Could not get tags.'} />]
        : data
        ? data.map((tag) => <SelectOption key={tag} value={tag} />)
        : []}
    </Select>
  );
};

export default ToolbarItemTags;
