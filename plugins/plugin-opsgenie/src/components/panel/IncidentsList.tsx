import React, { useState } from 'react';
import { DataList } from '@patternfly/react-core';

import { IIncident } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import Incident from './details/incident/Incident';
import IncidentsListItem from './IncidentsListItem';

interface IIncidentsListProps {
  instance: IPluginInstance;
  incidents: IIncident[];
  refetch: () => void;
  setDetails?: (details: React.ReactNode) => void;
}

const IncidentsList: React.FunctionComponent<IIncidentsListProps> = ({
  instance,
  incidents,
  refetch,
  setDetails,
}: IIncidentsListProps) => {
  const [selectedIncident, setSelectedIncident] = useState<string>();

  const selectIncident = (id: string): void => {
    const incident = incidents.filter((incident) => incident.id === id);
    if (setDetails && incident.length === 1) {
      setSelectedIncident(incident[0].id);
      setDetails(
        <Incident
          instance={instance}
          incident={incident[0]}
          refetch={refetch}
          close={(): void => {
            setSelectedIncident(undefined);
            setDetails(undefined);
          }}
        />,
      );
    }
  };

  return (
    <DataList
      aria-label="Incidents list"
      selectedDataListItemId={selectedIncident}
      onSelectDataListItem={selectIncident}
    >
      {incidents.map((incident) => (
        <IncidentsListItem key={incident.id} incident={incident} />
      ))}
    </DataList>
  );
};

export default IncidentsList;
