import {
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import React from 'react';

import { IAlert } from '../../utils/interfaces';
import Infos from './details/alert/Infos';
import { formatTimeWrapper } from '../../utils/helpers';

interface IAlertsListItemProps {
  alert: IAlert;
}

const AlertsListItem: React.FunctionComponent<IAlertsListItemProps> = ({ alert }: IAlertsListItemProps) => {
  return (
    <DataListItem id={alert.id} aria-labelledby={alert.id}>
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="main">
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <p>{alert.message}</p>
                </FlexItem>
                <Infos alert={alert} />
              </Flex>
            </DataListCell>,
          ]}
        />
        {alert.createdAt && (
          <DataListAction aria-labelledby={alert.id || ''} id={alert.id || ''} aria-label="Created at">
            {formatTimeWrapper(alert.createdAt)}
          </DataListAction>
        )}
      </DataListItemRow>
    </DataListItem>
  );
};

export default AlertsListItem;
