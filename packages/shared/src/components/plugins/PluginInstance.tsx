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

export interface IPluginInstanceProps {
  name: string;
  type: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

export const PluginInstance: React.FunctionComponent<IPluginInstanceProps> = ({
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
    <Card
      isHoverable={true}
      isCompact={true}
      onClick={(): void => navigate(`/plugins/${encodeURIComponent(type)}/${encodeURIComponent(name)}`)}
    >
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.xs}>
          <EmptyStateIcon variant="container" component={Icon} />
          <Title headingLevel="h2" size="md">
            {name}
          </Title>
          <EmptyStateBody>{description}</EmptyStateBody>
        </EmptyState>
      </Bullseye>
    </Card>
  );
};