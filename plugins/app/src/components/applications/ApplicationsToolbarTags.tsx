import React, { useState } from 'react';
import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { ITag } from '../../resources/tags';

interface IApplicationsToolbarTagsProps {
  selectedTags: string[];
  selectTag: (clusterIDs: string) => void;
}

const ApplicationsToolbarTags: React.FunctionComponent<IApplicationsToolbarTagsProps> = ({
  selectedTags,
  selectTag,
}: IApplicationsToolbarTagsProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data } = useQuery<ITag[], Error>(['app/applications/tags'], async () => {
    const response = await fetch(`/api/applications/tags`, {
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
  });

  return (
    <Select
      variant={SelectVariant.checkbox}
      aria-label="Select tags input"
      placeholderText="Tags"
      onToggle={(): void => setIsOpen(!isOpen)}
      onSelect={(
        event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
        value: string | SelectOptionObject,
      ): void => selectTag(value.toString())}
      onClear={(): void => selectTag('')}
      onFilter={(e: React.ChangeEvent<HTMLInputElement> | null, value: string): React.ReactElement[] =>
        data
          ? data
              .filter((tag) => !value || tag.tag.toLowerCase().includes(value.toLowerCase()))
              .map((tag: ITag) => <SelectOption key={tag.tag} value={tag.tag} />)
          : []
      }
      selections={selectedTags}
      isOpen={isOpen}
      hasInlineFilter={true}
      maxHeight="50vh"
    >
      {data && data.length > 0
        ? data.map((tag) => <SelectOption key={tag.tag} value={tag.tag} />)
        : [<SelectOption key="noresultsfound" value="No results found" isDisabled={true} />]}
    </Select>
  );
};

export default ApplicationsToolbarTags;
