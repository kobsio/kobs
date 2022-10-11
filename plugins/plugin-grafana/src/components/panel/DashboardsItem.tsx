import {
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Label,
} from '@patternfly/react-core';
import React from 'react';

import { IDashboard } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';

interface IDashboardItemProps {
  instance: IPluginInstance;
  dashboard: IDashboard;
  vars: string;
}

const DashboardItem: React.FunctionComponent<IDashboardItemProps> = ({
  instance,
  dashboard,
  vars,
}: IDashboardItemProps) => {
  return (
    <a
      style={{ color: 'inherit', textDecoration: 'inherit' }}
      href={`${instance.options?.address}${dashboard.url}${vars}`}
      target="_blank"
      rel="noreferrer"
    >
      <DataListItem id={`${dashboard.id}`} aria-labelledby={`${dashboard.id}`}>
        <DataListItemRow>
          <DataListItemCells
            dataListCells={[
              <DataListCell key="main">
                <Flex direction={{ default: 'column' }}>
                  <FlexItem>
                    <p>
                      {dashboard.title}
                      {dashboard.folderTitle && (
                        <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{dashboard.folderTitle}</span>
                      )}
                    </p>
                  </FlexItem>
                  {dashboard.tags && dashboard.tags.length > 0 && (
                    <Flex>
                      <FlexItem>
                        {dashboard.tags.map((tag) => (
                          <Label key={tag} className="pf-u-mr-sm" color="blue">
                            {tag}
                          </Label>
                        ))}
                      </FlexItem>
                    </Flex>
                  )}
                </Flex>
              </DataListCell>,
            ]}
          />
        </DataListItemRow>
      </DataListItem>
    </a>
  );
};

export default DashboardItem;
