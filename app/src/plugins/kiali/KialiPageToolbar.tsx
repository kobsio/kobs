import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Button,
  ButtonVariant,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import React, { useCallback, useEffect, useState } from 'react';

import { GetNamespacesRequest, GetNamespacesResponse, KialiPromiseClient } from 'proto/kiali_grpc_web_pb';
import { IKialiOptions } from 'plugins/kiali/helpers';
import KialiPageToolbarDuration from 'plugins/kiali/KialiPageToolbarDuration';
import KialiPageToolbarNamespaces from 'plugins/kiali/KialiPageToolbarNamespaces';
import { apiURL } from 'utils/constants';

// kialiService is the Clusters gRPC service, which is used to get all namespaces.
const kialiService = new KialiPromiseClient(apiURL, null, null);

interface IKialiPageToolbarProps extends IKialiOptions {
  name: string;
  setOptions: (data: IKialiOptions) => void;
}

interface IDataState {
  error: string;
  namespaces: string[];
}

const KialiPageToolbar: React.FunctionComponent<IKialiPageToolbarProps> = ({
  name,
  namespaces,
  duration,
  setOptions,
}: IKialiPageToolbarProps) => {
  const [opts, setOpts] = useState<IKialiOptions>({ duration: duration, namespaces: namespaces });
  const [data, setData] = useState<IDataState>({ error: '', namespaces: [] });

  // selectNamespace adds/removes the given namespace to the list of selected namespaces. When the namespace value is an
  // empty string the selected namespaces list is cleared.
  const selectNamespace = (namespace: string): void => {
    if (namespace === '') {
      setOpts({ ...opts, namespaces: [] });
    } else {
      if (opts.namespaces.includes(namespace)) {
        setOpts({ ...opts, namespaces: opts.namespaces.filter((item) => item !== namespace) });
      } else {
        setOpts({ ...opts, namespaces: [...opts.namespaces, namespace] });
      }
    }
  };

  // fetchNamespaces fetches a list of namespaces from the Kiali API.
  const fetchNamespaces = useCallback(async () => {
    try {
      const getNamespacesRequest = new GetNamespacesRequest();
      getNamespacesRequest.setName(name);

      const getNamespacesResponse: GetNamespacesResponse = await kialiService.getNamespaces(getNamespacesRequest, null);

      setData({
        error: '',
        namespaces: getNamespacesResponse.toObject().namespacesList.map((namespace) => namespace.name),
      });
    } catch (err) {
      setData({ error: err.message, namespaces: [] });
    }
  }, [name]);

  // useEffect is used to call the fetchNamespaces function on the first render of the component.
  useEffect(() => {
    fetchNamespaces();
  }, [fetchNamespaces]);

  if (data.error) {
    return (
      <Alert
        variant={AlertVariant.danger}
        isInline={true}
        title="Could not get namespaces"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={fetchNamespaces}>Retry</AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{data.error}</p>
      </Alert>
    );
  }

  return (
    <Toolbar id="kiali-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup style={{ alignItems: 'flex-start', width: '100%' }}>
            <ToolbarItem style={{ width: '100%' }}>
              <KialiPageToolbarNamespaces
                namespaces={data.namespaces}
                selectedNamespaces={opts.namespaces}
                selectNamespace={selectNamespace}
              />
            </ToolbarItem>
            <ToolbarItem>
              <KialiPageToolbarDuration
                duration={opts.duration}
                setDuration={(d: number): void => setOpts({ ...opts, duration: d })}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button variant={ButtonVariant.primary} icon={<SearchIcon />} onClick={(): void => setOptions(opts)}>
                Search
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default KialiPageToolbar;
