import { Alert, AlertVariant, Card } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IPluginPageProps, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import { IOptions } from '../../utils/interfaces';
import PageToolbar from './PageToolbar';
import PanelList from '../panel/PanelList';
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
    navigate(
      `${location.pathname}?time=${opts.times.time}&timeEnd=${opts.times.timeEnd}&timeStart=${opts.times.timeStart}&type=${opts.type}&cluster=${opts.cluster}&namespace=${opts.namespace}`,
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
        toolbarContent={<PageToolbar instance={instance} options={options} setOptions={changeOptions} />}
        panelContent={details}
      >
        <Card>
          {options.cluster === '' ? (
            <Alert variant={AlertVariant.info} isInline={true} title="Select a cluster">
              <p>Select a cluster from the toolbar.</p>
            </Alert>
          ) : (
            <PanelList
              instance={instance}
              type={options.type}
              cluster={options.cluster}
              namespace={options.namespace}
              setDetails={setDetails}
            />
          )}
        </Card>
      </PageContentSection>
    </React.Fragment>
  );
};

export default Page;
