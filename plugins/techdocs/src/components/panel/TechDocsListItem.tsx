import { MenuItem } from '@patternfly/react-core';
import React from 'react';

import { IIndex } from '../../utils/interfaces';
import { LinkWrapper } from '@kobsio/plugin-core';

interface ITechDocsListItemProps {
  name: string;
  index: IIndex;
}

const TechDocsListItem: React.FunctionComponent<ITechDocsListItemProps> = ({ name, index }: ITechDocsListItemProps) => {
  return (
    <LinkWrapper link={`/${name}/${index.key}`}>
      <MenuItem description={<div>{index.description}</div>}>{index.name}</MenuItem>
    </LinkWrapper>
  );
};

export default TechDocsListItem;
