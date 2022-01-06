import { Card, CardBody, PageSection, PageSectionVariants } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import ActualCosts from './ActualCosts';
import CostManagementToolbar from './CostManagementToolbar';
import { IOptions } from './interfaces';
import { Title } from '@kobsio/plugin-core';
import { getInitialOptions } from './helpers';
import { services } from '../../utils/services';

const service = 'costmanagement';

interface ICostManagementPageProps {
  name: string;
  displayName: string;
  resourceGroups: string[];
}

const CostManagementPage: React.FunctionComponent<ICostManagementPageProps> = ({
  name,
  displayName,
  resourceGroups,
}: ICostManagementPageProps) => {
  const history = useHistory();
  const location = useLocation();
  const [options, setOptions] = useState<IOptions>();

  const changeOptions = (opts: IOptions): void => {
    history.push({
      pathname: location.pathname,
      search: `?scope=${opts.scope}&time=${opts.times.time}&timeEnd=${opts.times.timeEnd}&timeStart=${opts.times.timeStart}`,
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
        <Title title={services[service].name} subtitle={displayName} size="xl" />
        <p>{services[service].description}</p>
        <CostManagementToolbar resourceGroups={resourceGroups} options={options} setOptions={changeOptions} />
      </PageSection>

      <PageSection variant={PageSectionVariants.default}>
        <Card isCompact={true}>
          <CardBody>
            <div style={{ height: '500px' }}>
              <ActualCosts name={name} scope={options.scope} times={options.times} />
            </div>
          </CardBody>
        </Card>
      </PageSection>
    </React.Fragment>
  );
};

export default CostManagementPage;
