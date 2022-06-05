import {
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Label,
} from '@patternfly/react-core';
import React from 'react';

import { IArtifact, IArtifactScanOverview } from '../../utils/interfaces';
import { formatBytes, formatTime } from '../../utils/helpers';
import { IPluginInstance } from '@kobsio/shared';

const formatVulnerabilities = (scanOverview: { [key: string]: IArtifactScanOverview }): React.ReactNode => {
  if (!scanOverview) {
    return <Label color="grey">Vulnerabilities: -</Label>;
  }

  const keys = Object.keys(scanOverview);
  if (keys.length > 0) {
    if (scanOverview[keys[0]].scan_status === 'Success') {
      if (scanOverview[keys[0]].severity === 'Critical' || scanOverview[keys[0]].severity === 'High') {
        return <Label color="red">Vulnerabilities: {scanOverview[keys[0]].severity}</Label>;
      }

      if (scanOverview[keys[0]].severity === 'Medium') {
        return <Label color="orange">Vulnerabilities: {scanOverview[keys[0]].severity}</Label>;
      }

      return <Label color="green">Vulnerabilities: {scanOverview[keys[0]].severity}</Label>;
    }

    return <Label color="blue">Vulnerabilities: {scanOverview[keys[0]].severity}</Label>;
  }

  return <Label color="grey">Vulnerabilities: -</Label>;
};

interface IArtifactsListItemProps {
  instance: IPluginInstance;
  projectName: string;
  repositoryName: string;
  artifact: IArtifact;
}

const ArtifactsListItem: React.FunctionComponent<IArtifactsListItemProps> = ({
  instance,
  projectName,
  repositoryName,
  artifact,
}: IArtifactsListItemProps) => {
  return (
    <DataListItem id={`${artifact.id}`} aria-labelledby={`${artifact.id}`}>
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="main">
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <p>{artifact.tags ? artifact.tags.map((tag) => tag.name).join(', ') : artifact.digest}</p>
                </FlexItem>
                <Flex>
                  <FlexItem>
                    <Label color="grey">Size: {formatBytes(artifact.size)}</Label>
                  </FlexItem>
                  <FlexItem>{formatVulnerabilities(artifact.scan_overview)}</FlexItem>
                  <FlexItem>
                    <Label color="grey">Push Time: {formatTime(artifact.push_time)}</Label>
                  </FlexItem>
                  <FlexItem>
                    <Label color="grey">Pull Time: {formatTime(artifact.pull_time)}</Label>
                  </FlexItem>
                  <FlexItem>
                    <Label color="grey">Digest: {artifact.digest}</Label>
                  </FlexItem>
                </Flex>
              </Flex>
            </DataListCell>,
          ]}
        />
      </DataListItemRow>
    </DataListItem>
  );
};

export default ArtifactsListItem;
