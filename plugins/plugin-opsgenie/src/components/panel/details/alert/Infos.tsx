import { Flex, FlexItem, Label } from '@patternfly/react-core';
import React from 'react';

import { IAlert } from '../../../../utils/interfaces';
import Priority from '../Priority';
import Status from '../Status';

interface IInfosProps {
  alert: IAlert;
}

const Infos: React.FunctionComponent<IInfosProps> = ({ alert }: IInfosProps) => {
  return (
    <Flex>
      <FlexItem>
        <span>
          <span className="pf-u-mr-sm pf-u-color-400">Priority:</span>
          <Priority priority={alert.priority || ''} />
        </span>
      </FlexItem>

      <FlexItem>
        <span>
          <span className="pf-u-mr-sm pf-u-color-400">Status:</span>
          <Status
            status={alert.status || ''}
            snoozed={alert.snoozed || false}
            acknowledged={alert.acknowledged || false}
          />
        </span>
      </FlexItem>

      {alert.owner && (
        <FlexItem>
          <span>
            <span className="pf-u-mr-sm pf-u-color-400">Owner:</span>
            <Label color="grey">{alert.owner}</Label>
          </span>
        </FlexItem>
      )}

      {alert.tags && alert.tags.length > 0 && (
        <FlexItem>
          <span>
            <span className="pf-u-mr-sm pf-u-color-400">Tags:</span>
            {alert.tags.map((tag) => (
              <Label key={tag} className="pf-u-mr-sm" color="grey">
                {tag}
              </Label>
            ))}
          </span>
        </FlexItem>
      )}
    </Flex>
  );
};

export default Infos;
