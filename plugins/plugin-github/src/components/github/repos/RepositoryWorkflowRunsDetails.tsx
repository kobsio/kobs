import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Title,
} from '@patternfly/react-core';
import { CheckCircleFillIcon, DotFillIcon, DotIcon, XCircleFillIcon } from '@primer/octicons-react';
import React from 'react';

import Details from '../Details';
import { IPluginInstance } from '@kobsio/shared';
import RepositoryWorkflowRunsDetailsJobs from './RepositoryWorkflowRunsDetailsJobs';

interface IRepositoryWorkflowRunsDetailsProps {
  repo: string;
  id: number;
  attempt: number;
  url: string;
  branch: string;
  message: string;
  author: string;
  status: string;
  conclusion: string;
  instance: IPluginInstance;
  close: () => void;
}

const RepositoryWorkflowRunsDetails: React.FunctionComponent<IRepositoryWorkflowRunsDetailsProps> = ({
  repo,
  id,
  attempt,
  url,
  branch,
  message,
  author,
  status,
  conclusion,
  instance,
  close,
}: IRepositoryWorkflowRunsDetailsProps) => {
  return (
    <Details title="Workflow Run Details" link={url} instance={instance} close={close}>
      <Card isCompact={true}>
        <CardBody>
          <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
            <DescriptionListGroup>
              <DescriptionListTerm>Branch</DescriptionListTerm>
              <DescriptionListDescription>{branch}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Message</DescriptionListTerm>
              <DescriptionListDescription>{message}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Author</DescriptionListTerm>
              <DescriptionListDescription>{author}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Status</DescriptionListTerm>
              <DescriptionListDescription>
                {status === 'queued' ? (
                  <DotIcon size={16} fill="#c69026" />
                ) : status === 'in_progress' ? (
                  <DotFillIcon size={16} fill="#c69026" />
                ) : conclusion === 'success' ? (
                  <CheckCircleFillIcon size={16} fill="#57ab5a" />
                ) : (
                  <XCircleFillIcon size={16} fill="#e5534b" />
                )}
                <span className="pf-u-pl-sm">{status}</span>
              </DescriptionListDescription>
            </DescriptionListGroup>

            <React.Fragment>
              <Title headingLevel="h4" size="lg">
                Jobs
              </Title>
              <RepositoryWorkflowRunsDetailsJobs repo={repo} id={id} attempt={attempt} instance={instance} />
            </React.Fragment>
          </DescriptionList>
        </CardBody>
      </Card>
    </Details>
  );
};

export default RepositoryWorkflowRunsDetails;
