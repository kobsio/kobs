import { DataListCell, DataListItem, DataListItemCells, DataListItemRow, Flex, FlexItem } from '@patternfly/react-core';
import React from 'react';

import { IPluginInstance, LinkWrapper, pluginBasePath } from '@kobsio/shared';
import { IIndex } from '../../utils/interfaces';

interface ITechDocsListItemProps {
  instance: IPluginInstance;
  index: IIndex;
}

const TechDocsListItem: React.FunctionComponent<ITechDocsListItemProps> = ({
  instance,
  index,
}: ITechDocsListItemProps) => {
  return (
    <LinkWrapper to={`${pluginBasePath(instance)}/${index.key}`}>
      <DataListItem id={index.key} aria-labelledby={index.key}>
        <DataListItemRow>
          <DataListItemCells
            dataListCells={[
              <DataListCell key="main">
                <Flex direction={{ default: 'column' }}>
                  <FlexItem>
                    <p>{index.name}</p>
                    <small>{index.description}</small>
                  </FlexItem>
                </Flex>
              </DataListCell>,
            ]}
          />
        </DataListItemRow>
      </DataListItem>
    </LinkWrapper>
  );
};

export default TechDocsListItem;
