import { Badge } from '@patternfly/react-core';
import React from 'react';

import { IIncident } from '../../../../utils/interfaces';
import Priority from '../Priority';
import Status from '../Status';

interface IInfosProps {
  incident: IIncident;
}

const Infos: React.FunctionComponent<IInfosProps> = ({ incident }: IInfosProps) => {
  return (
    <React.Fragment>
      <span className="pf-u-mr-xl">
        <span className="pf-u-mr-sm pf-u-color-400">Priority:</span>
        <Priority priority={incident.priority || ''} />
      </span>

      <span className="pf-u-mr-xl ">
        <span className="pf-u-mr-sm pf-u-color-400">Status:</span>
        <Status status={incident.status || ''} snoozed={false} acknowledged={false} />
      </span>

      {incident.ownerTeam ? (
        <span className="pf-u-mr-xl ">
          <span className="pf-u-mr-sm pf-u-color-400">Owner:</span>
          {incident.ownerTeam}
        </span>
      ) : null}

      {incident.tags && incident.tags.length > 0 ? (
        <span className="pf-u-mr-xl ">
          <span className="pf-u-mr-sm pf-u-color-400">Tags:</span>
          {incident.tags.map((tag) => (
            <Badge key={tag} className="pf-u-mr-sm" isRead={true}>
              {tag}
            </Badge>
          ))}
        </span>
      ) : null}

      {incident.extraProperties && Object.keys(incident.extraProperties).length > 0 ? (
        <span className="pf-u-mr-xl ">
          <span className="pf-u-mr-sm pf-u-color-400">Extra Properties:</span>
          {Object.keys(incident.extraProperties).map((extraProperty) => (
            <Badge key={extraProperty} className="pf-u-mr-sm" isRead={true}>
              {extraProperty}: {incident.extraProperties ? incident.extraProperties[extraProperty] : ''}
            </Badge>
          ))}
        </span>
      ) : null}
    </React.Fragment>
  );
};

export default Infos;
