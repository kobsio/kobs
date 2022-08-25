import React, { useState } from 'react';
import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { IPluginInstance } from '@kobsio/shared';
import { ISite } from '../../utils/interfaces';

interface IToolbarItemSitesProps {
  instance: IPluginInstance;
  selectedSite: string;
  selectSite: (site: string) => void;
}

const ToolbarItemSites: React.FunctionComponent<IToolbarItemSitesProps> = ({
  instance,
  selectedSite,
  selectSite,
}: IToolbarItemSitesProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data } = useQuery<ISite[], Error>(['signalsciences/sites', instance], async () => {
    const response = await fetch(`/api/plugins/signalsciences/sites`, {
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
  });

  return (
    <Select
      variant={SelectVariant.typeahead}
      aria-label="Select site input"
      placeholderText="Site"
      onToggle={(): void => setIsOpen(!isOpen)}
      onSelect={(
        event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
        value: string | SelectOptionObject,
      ): void => selectSite(value.toString())}
      onClear={(): void => selectSite('')}
      onFilter={(e: React.ChangeEvent<HTMLInputElement> | null, value: string): React.ReactElement[] =>
        data
          ? data
              .filter((site) => !value || site.Name.toLowerCase().includes(value.toLowerCase()))
              .map((site: ISite) => (
                <SelectOption key={site.Name} value={site.Name}>
                  {site.DisplayName}
                </SelectOption>
              ))
          : []
      }
      selections={selectedSite}
      isOpen={isOpen}
      hasInlineFilter={true}
      maxHeight="50vh"
    >
      {data && data.length > 0
        ? data.map((site) => (
            <SelectOption key={site.Name} value={site.Name}>
              {site.DisplayName}
            </SelectOption>
          ))
        : [<SelectOption key="noresultsfound" value="No results found" isDisabled={true} />]}
    </Select>
  );
};

export default ToolbarItemSites;
