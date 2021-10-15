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

import { IOptionsAdditionalFields, Options } from '@kobsio/plugin-core';
import { IOptions } from '../../utils/interfaces';
import PageToolbarNamespaces from './PageToolbarNamespaces';

interface IPageToolbarProps extends IOptions {
  name: string;
  setOptions: (data: IOptions) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({
  name,
  times,
  namespaces,
  setOptions,
}: IPageToolbarProps) => {
  const [data, setData] = useState<IOptions>({
    namespaces: namespaces,
    times: times,
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

  const changeOptions = (
    refresh: boolean,
    additionalFields: IOptionsAdditionalFields[] | undefined,
    timeEnd: number,
    timeStart: number,
  ): void => {
    const tmpData = { ...data };

    if (refresh) {
      setOptions({
        ...tmpData,
        times: { timeEnd: timeEnd, timeStart: timeStart },
      });
    }

    setData({
      ...tmpData,
      times: { timeEnd: timeEnd, timeStart: timeStart },
    });
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
              <Options timeEnd={data.times.timeEnd} timeStart={data.times.timeStart} setOptions={changeOptions} />
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
