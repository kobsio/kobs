import { Badge } from '@patternfly/react-core';
import React from 'react';

import { IAlert } from '../../../../utils/interfaces';
import Priority from '../Priority';
import Status from '../Status';

interface IInfosProps {
  alert: IAlert;
}

const Infos: React.FunctionComponent<IInfosProps> = ({ alert }: IInfosProps) => {
  return (
    <React.Fragment>
      <span className="pf-u-mr-xl">
        <span className="pf-u-mr-sm pf-u-color-400">Priority:</span>
        <Priority priority={alert.priority || ''} />
      </span>

      <span className="pf-u-mr-xl ">
        <span className="pf-u-mr-sm pf-u-color-400">Status:</span>
        <Status
          status={alert.status || ''}
          snoozed={alert.snoozed || false}
          acknowledged={alert.acknowledged || false}
        />
      </span>

      {alert.owner ? (
        <span className="pf-u-mr-xl ">
          <span className="pf-u-mr-sm pf-u-color-400">Owner:</span>
          {alert.owner}
        </span>
      ) : null}

      {alert.tags && alert.tags.length > 0 ? (
        <span className="pf-u-mr-xl ">
          <span className="pf-u-mr-sm pf-u-color-400">Tags:</span>
          {alert.tags.map((tag) => (
            <Badge key={tag} className="pf-u-mr-sm" isRead={true}>
              {tag}
            </Badge>
          ))}
        </span>
      ) : null}
    </React.Fragment>
  );
};

export default Infos;
