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

import { IIncident } from '../../utils/interfaces';
import Infos from './details/incident/Infos';
import { formatTimeWrapper } from '../../utils/helpers';

interface IIncidentsItemProps {
  incident: IIncident;
}

const IncidentsItem: React.FunctionComponent<IIncidentsItemProps> = ({ incident }: IIncidentsItemProps) => {
  return (
    <DataListItem id={incident.id} aria-labelledby={incident.id}>
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="main">
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <p>{incident.message}</p>
                </FlexItem>
                <Infos incident={incident} />
              </Flex>
            </DataListCell>,
          ]}
        />
        {incident.createdAt && (
          <DataListAction aria-labelledby={incident.id || ''} id={incident.id || ''} aria-label="Created at">
            {formatTimeWrapper(incident.createdAt)}
          </DataListAction>
        )}
      </DataListItemRow>
    </DataListItem>
  );
};

export default IncidentsItem;
