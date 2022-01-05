import { MenuItem } from '@patternfly/react-core';
import React from 'react';

import { IDashboardReference, LinkWrapper } from '@kobsio/plugin-core';

interface IPanelItemProps {
  reference: IDashboardReference;
}

const PanelItem: React.FunctionComponent<IPanelItemProps> = ({ reference }: IPanelItemProps) => {
  const placeholderParams = reference.placeholders
    ? Object.keys(reference.placeholders).map(
        (key) => `&${key}=${reference.placeholders ? reference.placeholders[key] : ''}`,
      )
    : undefined;

  return (
    <LinkWrapper
      link={`/dashboards/${reference.cluster}/${reference.namespace}/${reference.name}?${
        placeholderParams && placeholderParams.length > 0 ? placeholderParams.join('') : ''
      }`}
    >
      <MenuItem description={reference.description}>{reference.title}</MenuItem>
    </LinkWrapper>
  );
};

export default PanelItem;
