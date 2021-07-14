import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { IPluginDefaults, LinkWrapper } from '@kobsio/plugin-core';
import { IReference } from '../../utils/interfaces';

interface IPanelItemProps {
  defaults: IPluginDefaults;
  reference: IReference;
}

const PanelItem: React.FunctionComponent<IPanelItemProps> = ({ defaults, reference }: IPanelItemProps) => {
  const placeholderParams = reference.placeholders
    ? Object.keys(reference.placeholders).map(
        (key) => `&${key}=${reference.placeholders ? reference.placeholders[key] : ''}`,
      )
    : undefined;

  return (
    <LinkWrapper
      link={`/dashboards/${reference.cluster || defaults.cluster}/${reference.namespace || defaults.namespace}/${
        reference.name
      }?defaultCluster=${defaults.cluster}&defaultNamespace=${defaults.namespace}${
        placeholderParams && placeholderParams.length > 0 ? placeholderParams.join('') : ''
      }`}
    >
      <Card isCompact={true} isHoverable={true}>
        <CardHeader>
          <CardTitle>{reference.title}</CardTitle>
        </CardHeader>
        <CardBody>{reference.description || ''}</CardBody>
      </Card>
    </LinkWrapper>
  );
};

export default PanelItem;
