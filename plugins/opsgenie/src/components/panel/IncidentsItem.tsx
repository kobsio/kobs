import { Card, CardActions, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { IIncident } from '../../utils/interfaces';
import Incident from './details/incident/Incident';
import Infos from './details/incident/Infos';
import { formatTimeWrapper } from '../../utils/helpers';

interface IIncidentsItemProps {
  name: string;
  incident: IIncident;
  setDetails?: (details: React.ReactNode) => void;
}

const IncidentsItem: React.FunctionComponent<IIncidentsItemProps> = ({
  name,
  incident,
  setDetails,
}: IIncidentsItemProps) => {
  return (
    <Card
      style={{ cursor: 'pointer' }}
      isCompact={true}
      isHoverable={true}
      onClick={
        setDetails
          ? (): void =>
              setDetails(<Incident name={name} incident={incident} close={(): void => setDetails(undefined)} />)
          : undefined
      }
    >
      <CardHeader>
        {incident.createdAt ? (
          <CardActions>
            <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{formatTimeWrapper(incident.createdAt)}</span>
          </CardActions>
        ) : null}
        <CardTitle>{incident.message}</CardTitle>
      </CardHeader>
      <CardBody>
        <Infos incident={incident} />
      </CardBody>
    </Card>
  );
};

export default IncidentsItem;
