import { MenuItem } from '@patternfly/react-core';
import React from 'react';

import { COLOR_DANGER, COLOR_OK, COLOR_WARNING, formatBytes, formatTime } from '../../utils/helpers';
import { IArtifact, IArtifactScanOverview } from '../../utils/interfaces';
import Details from './details/Details';

const formatScanStatus = (scanOverview: IArtifactScanOverview): React.ReactNode => {
  if (scanOverview.severity === 'Critical' || scanOverview.severity === 'High') {
    return <span style={{ color: COLOR_DANGER }}>{scanOverview.severity}</span>;
  } else if (scanOverview.severity === 'Medium') {
    return <span style={{ color: COLOR_WARNING }}>{scanOverview.severity}</span>;
  } else {
    return <span style={{ color: COLOR_OK }}>{scanOverview.severity}</span>;
  }
};

interface IArtifactsItemProps {
  name: string;
  address: string;
  projectName: string;
  repositoryName: string;
  artifact: IArtifact;
  setDetails?: (details: React.ReactNode) => void;
}

const ArtifactsItem: React.FunctionComponent<IArtifactsItemProps> = ({
  name,
  address,
  projectName,
  repositoryName,
  artifact,
  setDetails,
}: IArtifactsItemProps) => {
  return (
    <MenuItem
      description={
        <div>
          <span>
            <span className="pf-u-color-400">Size: </span>
            <b className="pf-u-pr-md">{formatBytes(artifact.size)}</b>
          </span>
          <span>
            <span className="pf-u-color-400">Vulnerabilities: </span>
            <b className="pf-u-pr-md">
              {artifact.scan_overview
                ? Object.keys(artifact.scan_overview).map((key) => (
                    <span key={key}>
                      {artifact.scan_overview[key].scan_status === 'Success'
                        ? formatScanStatus(artifact.scan_overview[key])
                        : artifact.scan_overview[key].scan_status}
                    </span>
                  ))
                : '-'}
            </b>
          </span>
          <span>
            <span className="pf-u-color-400">Push Time: </span>
            <b className="pf-u-pr-md">{formatTime(artifact.push_time)}</b>
          </span>
          <span>
            <span className="pf-u-color-400">Pull Time: </span>
            <b className="pf-u-pr-md">{formatTime(artifact.pull_time)}</b>
          </span>
          {artifact.tags ? (
            <span>
              <span className="pf-u-color-400">Digest: </span>
              <b className="pf-u-pr-md">{artifact.digest}</b>
            </span>
          ) : null}
        </div>
      }
      onClick={
        setDetails
          ? (): void =>
              setDetails(
                <Details
                  name={name}
                  address={address}
                  projectName={projectName}
                  repositoryName={repositoryName}
                  artifact={artifact}
                  close={(): void => setDetails(undefined)}
                />,
              )
          : undefined
      }
    >
      {artifact.tags ? artifact.tags.map((tag) => tag.name).join(', ') : artifact.digest}
    </MenuItem>
  );
};

export default ArtifactsItem;
