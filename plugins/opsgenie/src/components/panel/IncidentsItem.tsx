import { MenuItem } from '@patternfly/react-core';
import React from 'react';

import { IIncident } from '../../utils/interfaces';
import Incident from './details/incident/Incident';
import Infos from './details/incident/Infos';
import { formatTimeWrapper } from '../../utils/helpers';

interface IIncidentsItemProps {
  name: string;
  incident: IIncident;
  refetch: () => void;
  setDetails?: (details: React.ReactNode) => void;
}

const IncidentsItem: React.FunctionComponent<IIncidentsItemProps> = ({
  name,
  incident,
  refetch,
  setDetails,
}: IIncidentsItemProps) => {
  return (
    <MenuItem
      description={<Infos incident={incident} />}
      onClick={
        setDetails
          ? (): void =>
              setDetails(
                <Incident
                  name={name}
                  incident={incident}
                  refetch={refetch}
                  close={(): void => setDetails(undefined)}
                />,
              )
          : undefined
      }
    >
      {incident.message}
      {incident.createdAt ? (
        <span className="pf-u-float-right pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
          {formatTimeWrapper(incident.createdAt)}
        </span>
      ) : null}
    </MenuItem>
  );
};

export default IncidentsItem;
