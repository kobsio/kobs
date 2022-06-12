import {
  Bullseye,
  Card,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { pluginBasePathAlt } from '../../utils/plugins';

export interface IPluginInstanceProps {
  satellite: string;
  name: string;
  type: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

export const PluginInstance: React.FunctionComponent<IPluginInstanceProps> = ({
  satellite,
  name,
  type,
  description,
  icon,
}: IPluginInstanceProps) => {
  const navigate = useNavigate();

  const Icon = (): React.ReactElement => {
    return <img src={icon} alt={`${name} icon`} style={{ maxWidth: '64px' }} />;
  };

  return (
    <Card isHoverable={true} isCompact={true} onClick={(): void => navigate(pluginBasePathAlt(satellite, type, name))}>
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.xs}>
          <EmptyStateIcon variant="container" component={Icon} />
          <Title headingLevel="h2" size="md">
            {name}
            <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">({satellite})</span>
          </Title>
          <EmptyStateBody>{description}</EmptyStateBody>
        </EmptyState>
      </Bullseye>
    </Card>
  );
};
