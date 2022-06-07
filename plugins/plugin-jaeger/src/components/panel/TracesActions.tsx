import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import { IQuery } from '../../utils/interfaces';

interface ITracesActionsProps {
  instance: IPluginInstance;
  queries: IQuery[];
  times: ITimes;
}

export const TracesActions: React.FunctionComponent<ITracesActionsProps> = ({
  instance,
  queries,
  times,
}: ITracesActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <CardActions>
      <Dropdown
        toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
        isOpen={show}
        isPlain={true}
        position="right"
        dropdownItems={queries.map((query, index) => (
          <DropdownItem
            key={index}
            component={
              <Link
                to={`/plugins/${instance.satellite}/${instance.type}/${instance.name}/?limit=${
                  query.limit || '20'
                }&maxDuration=${query.maxDuration || ''}&minDuration=${query.minDuration || ''}&operation=${
                  query.operation || ''
                }&service=${query.service || ''}&tags=${query.tags || ''}&time=${times.time}&timeEnd=${
                  times.timeEnd
                }&timeStart=${times.timeStart}`}
              >
                {query.name}
              </Link>
            }
          />
        ))}
      />
    </CardActions>
  );
};

export default TracesActions;
