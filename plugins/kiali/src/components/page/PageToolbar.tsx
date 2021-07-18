import {
  Button,
  ButtonVariant,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import React, { useState } from 'react';

import { IPanelOptions } from '../../utils/interfaces';
import PageToolbarDuration from './PageToolbarDuration';
import PageToolbarNamespaces from './PageToolbarNamespaces';

interface IPageToolbarProps extends IPanelOptions {
  name: string;
  setOptions: (data: IPanelOptions) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({
  name,
  duration,
  namespaces,
  setOptions,
}: IPageToolbarProps) => {
  const [data, setData] = useState<IPanelOptions>({
    duration: duration,
    namespaces: namespaces,
  });

  // selectNamespace adds/removes the given namespace to the list of selected namespaces. When the namespace value is an
  // empty string the selected namespaces list is cleared.
  const selectNamespace = (namespace: string): void => {
    if (namespace === '') {
      setData({ ...data, namespaces: [] });
    } else {
      if (data.namespaces) {
        if (data.namespaces.includes(namespace)) {
          setData({ ...data, namespaces: data.namespaces.filter((item) => item !== namespace) });
        } else {
          setData({ ...data, namespaces: [...data.namespaces, namespace] });
        }
      } else {
        setData({ ...data, namespaces: [namespace] });
      }
    }
  };

  return (
    <Toolbar id="kiali-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup style={{ alignItems: 'flex-start', width: '100%' }}>
            <ToolbarItem style={{ width: '100%' }}>
              <PageToolbarNamespaces name={name} namespaces={data.namespaces || []} selectNamespace={selectNamespace} />
            </ToolbarItem>
            <ToolbarItem>
              <PageToolbarDuration
                duration={data.duration || 900}
                setDuration={(d: number): void => setData({ ...data, duration: d })}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button variant={ButtonVariant.primary} icon={<SearchIcon />} onClick={(): void => setOptions(data)}>
                Search
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default PageToolbar;
