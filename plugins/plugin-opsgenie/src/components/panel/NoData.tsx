import { EmptyState, EmptyStateBody, EmptyStateIcon, Title } from '@patternfly/react-core';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import React from 'react';

export interface IIncidentProps {
  title: string;
  description: string;
}

const NoData: React.FunctionComponent<IIncidentProps> = ({ title, description }: IIncidentProps) => {
  return (
    <EmptyState>
      <EmptyStateIcon variant="icon" icon={InfoCircleIcon} />
      <Title headingLevel="h4" size="lg">
        {title}
      </Title>
      <EmptyStateBody>{description}</EmptyStateBody>
    </EmptyState>
  );
};

export default NoData;
