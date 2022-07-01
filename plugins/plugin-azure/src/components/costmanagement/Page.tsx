import { Card, CardBody } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import ActualCosts from './ActualCosts';
import CostManagementToolbar from './CostManagementToolbar';
import { IOptions } from './interfaces';
import { getInitialOptions } from './helpers';
import { services } from '../../utils/services';

const service = 'costmanagement';

interface ICostManagementPageProps {
  instance: IPluginInstance;
  resourceGroups: string[];
}

const CostManagementPage: React.FunctionComponent<ICostManagementPageProps> = ({
  instance,
  resourceGroups,
}: ICostManagementPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [options, setOptions] = useState<IOptions>();

  const changeOptions = (opts: IOptions): void => {
    navigate(
      `${location.pathname}?scope=${opts.scope}&time=${opts.times.time}&timeEnd=${opts.times.timeEnd}&timeStart=${opts.times.timeStart}`,
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
            satellite={`${instance.name} / ${instance.satellite}`}
            name={services[service].name}
            description={services[service].description}
          />
        }
      />

      <PageContentSection
        hasPadding={true}
        hasDivider={true}
        toolbarContent={
          <CostManagementToolbar resourceGroups={resourceGroups} options={options} setOptions={changeOptions} />
        }
        panelContent={undefined}
      >
        <Card isCompact={true}>
          <CardBody>
            <div style={{ height: '750px' }}>
              <ActualCosts instance={instance} scope={options.scope} times={options.times} />
            </div>
          </CardBody>
        </Card>
      </PageContentSection>
    </React.Fragment>
  );
};

export default CostManagementPage;
