import React, { useState } from 'react';
import { DataList } from '@patternfly/react-core';

import ArtifactsListItem from './ArtifactsListItem';
import Details from './details/Details';
import { IArtifact } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';

interface IArtifactsListProps {
  instance: IPluginInstance;
  projectName: string;
  repositoryName: string;
  artifacts: IArtifact[];
  setDetails?: (details: React.ReactNode) => void;
}

const ArtifactsList: React.FunctionComponent<IArtifactsListProps> = ({
  instance,
  projectName,
  repositoryName,
  artifacts,
  setDetails,
}: IArtifactsListProps) => {
  const [selectedArtifact, setSelectedArtifact] = useState<string>();

  const selectArtifact = (id: string): void => {
    const selectedArtifacts = artifacts.filter((artifact) => `${artifact.id}` === id);
    if (setDetails && selectedArtifacts.length === 1) {
      setDetails(
        <Details
          instance={instance}
          projectName={projectName}
          repositoryName={repositoryName}
          artifact={selectedArtifacts[0]}
          close={(): void => {
            setDetails(undefined);
            setSelectedArtifact(undefined);
          }}
        />,
      );
      setSelectedArtifact(id);
    }
  };

  return (
    <DataList
      aria-label="artifacts list"
      selectedDataListItemId={selectedArtifact}
      onSelectDataListItem={selectArtifact}
    >
      {artifacts.map((artifact) => (
        <ArtifactsListItem
          key={artifact.id}
          instance={instance}
          projectName={projectName}
          repositoryName={repositoryName}
          artifact={artifact}
        />
      ))}
    </DataList>
  );
};

export default ArtifactsList;
