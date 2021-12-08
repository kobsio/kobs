import { PageSection, PageSectionVariants } from '@patternfly/react-core';
import React, { useState } from 'react';

import ActualCosts from './ActualCosts';
import CostManagementToolbar from './CostManagementToolbar';
import { Title } from '@kobsio/plugin-core';
import { services } from '../../utils/services';

const service = 'costmanagement';

interface ICostManagementPageProps {
  name: string;
  displayName: string;
}

const CostManagementPage: React.FunctionComponent<ICostManagementPageProps> = ({
  name,
  displayName,
}: ICostManagementPageProps) => {
  const [timeframe, setTimeframe] = useState<number>(7);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title title={services[service].name} subtitle={displayName} size="xl" />
        <p>{services[service].description}</p>
        <CostManagementToolbar timeframe={timeframe} setTimeframe={setTimeframe} />
      </PageSection>

      <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
        <ActualCosts name={name} timeframe={timeframe} />
      </PageSection>
    </React.Fragment>
  );
};

export default CostManagementPage;
