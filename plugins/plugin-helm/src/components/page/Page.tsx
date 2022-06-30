import { Alert, AlertVariant, Card, CardBody } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IPluginPageProps, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import { IOptions } from '../../utils/interfaces';
import PageToolbar from './PageToolbar';
import Releases from '../panel/Releases';
import { defaultDescription } from '../../utils/constants';
import { getInitialOptions } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [options, setOptions] = useState<IOptions>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  // changeOptions is used to change the options. Besides setting a new value for the options state we also reflect the
  // options in the current url.
  const changeOptions = (opts: IOptions): void => {
    const clusterParams = opts.clusters.map((cluster) => `&cluster=${cluster}`);
    const namespaceParams = opts.namespaces.map((namespace) => `&namespace=${namespace}`);

    navigate(
      `${location.pathname}?time=${opts.times.time}&timeEnd=${opts.times.timeEnd}&timeStart=${opts.times.timeStart}${
        clusterParams.length > 0 ? clusterParams.join('') : ''
      }${namespaceParams.length > 0 ? namespaceParams.join('') : ''}`,
    );
  };

  useEffect(() => {
    setOptions((prevOptions) => getInitialOptions(location.search, !prevOptions));
  }, [location.search]);

  if (!options) {
    return null;
  }

  return (
    <React.Fragment>
      <PageHeaderSection
        component={
          <PluginPageTitle
            satellite={instance.satellite}
            name={instance.name}
            description={instance.description || defaultDescription}
          />
        }
      />

      <PageContentSection
        hasPadding={true}
        hasDivider={true}
        toolbarContent={<PageToolbar instance={instance} options={options} setOptions={changeOptions} />}
        panelContent={details}
      >
        {options.clusters.length === 0 ? (
          <Alert variant={AlertVariant.info} title="Select clusters and namespaces">
            <p>Select a list of clusters and namespaces from the toolbar.</p>
          </Alert>
        ) : (
          <Card isCompact={true}>
            <CardBody>
              <Releases
                instance={instance}
                clusters={options.clusters}
                namespaces={options.namespaces}
                times={options.times}
                setDetails={setDetails}
              />
            </CardBody>
          </Card>
        )}
      </PageContentSection>
    </React.Fragment>
  );
};

export default Page;
