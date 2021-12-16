import {
  Alert,
  AlertVariant,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { IOptions } from '../../utils/interfaces';
import { IPluginPageProps } from '@kobsio/plugin-core';
import PageToolbar from './PageToolbar';
import Panel from '../panel/Panel';
import { getInitialOptions } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  const history = useHistory();
  const location = useLocation();
  const [options, setOptions] = useState<IOptions>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  // changeOptions is used to change the options. Besides setting a new value for the options state we also reflect the
  // options in the current url.
  const changeOptions = (opts: IOptions): void => {
    const clusterParams = opts.clusters.map((cluster) => `&cluster=${cluster}`);
    const namespaceParams = opts.namespaces.map((namespace) => `&namespace=${namespace}`);
    const resourceParams = opts.resources.map((resource) => `&resource=${resource}`);

    history.push({
      pathname: location.pathname,
      search: `?selector=${opts.selector}${clusterParams.length > 0 ? clusterParams.join('') : ''}${
        namespaceParams.length > 0 ? namespaceParams.join('') : ''
      }${resourceParams.length > 0 ? resourceParams.join('') : ''}`,
    });
  };

  useEffect(() => {
    setOptions((prevOptions) => getInitialOptions(location.search, !prevOptions));
  }, [location.search]);

  if (!options) {
    return null;
  }

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {displayName}
        </Title>
        <p>{description}</p>
        <PageToolbar options={options} setOptions={changeOptions} />
      </PageSection>

      <Drawer isExpanded={details !== undefined}>
        <DrawerContent panelContent={details}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              {options.clusters.length === 0 || options.resources.length === 0 ? (
                <Alert variant={AlertVariant.info} title="Select clusters, resources and namespaces">
                  <p>Select a list of clusters, resources and namespaces from the toolbar.</p>
                </Alert>
              ) : (
                <Panel
                  defaults={{ cluster: '', name: '', namespace: '' }}
                  name={name}
                  title=""
                  options={[options]}
                  times={options.times}
                  showDetails={setDetails}
                />
              )}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Page;
