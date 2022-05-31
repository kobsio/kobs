import { Flex, FlexItem, Label } from '@patternfly/react-core';
import React from 'react';

import { IIncident } from '../../../../utils/interfaces';
import Priority from '../Priority';
import Status from '../Status';

interface IInfosProps {
  incident: IIncident;
}

const Infos: React.FunctionComponent<IInfosProps> = ({ incident }: IInfosProps) => {
  return (
    <Flex>
      <FlexItem>
        <span>
          <span className="pf-u-mr-sm pf-u-color-400">Priority:</span>
          <Priority priority={incident.priority || ''} />
        </span>
      </FlexItem>

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

      {incident.tags && incident.tags.length > 0 && (
        <FlexItem>
          <span>
            <span className="pf-u-mr-sm pf-u-color-400">Tags:</span>
            {incident.tags.map((tag) => (
              <Label key={tag} className="pf-u-mr-sm" color="grey">
                {tag}
              </Label>
            ))}
          </span>
        </FlexItem>
      )}

      {incident.extraProperties && Object.keys(incident.extraProperties).length > 0 && (
        <FlexItem>
          <span>
            <span className="pf-u-mr-sm pf-u-color-400">Extra Properties:</span>
            {Object.keys(incident.extraProperties).map((extraProperty) => (
              <Label key={extraProperty} className="pf-u-mr-sm" color="grey">
                {extraProperty}: {incident.extraProperties ? incident.extraProperties[extraProperty] : ''}
              </Label>
            ))}
          </span>
        </FlexItem>
      )}
    </Flex>
  );
};

export default Infos;
