import { MenuItem } from '@patternfly/react-core';
import React from 'react';

import { IDashboardReference, IPluginDefaults, LinkWrapper } from '@kobsio/plugin-core';

interface IPanelItemProps {
  defaults: IPluginDefaults;
  reference: IDashboardReference;
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
      <MenuItem description={reference.description}>{reference.title}</MenuItem>
    </LinkWrapper>
  );
};

export default PanelItem;
