import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '@patternfly/react-core';
import React from 'react';
import { V1Job } from '@kubernetes/client-node';

import Conditions from 'components/resources/overview/Conditions';
import Selector from 'components/resources/overview/Selector';

interface IJobProps {
  cluster: string;
  namespace: string;
  job: V1Job;
}

const Job: React.FunctionComponent<IJobProps> = ({ cluster, namespace, job }: IJobProps) => {
  return (
    <React.Fragment>
      <DescriptionListGroup>
        <DescriptionListTerm>Completions</DescriptionListTerm>
        <DescriptionListDescription>{job.spec?.completions ? job.spec?.completions : 0}</DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>Backoff Limit</DescriptionListTerm>
        <DescriptionListDescription>{job.spec?.backoffLimit ? job.spec?.backoffLimit : 0}</DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>Active</DescriptionListTerm>
        <DescriptionListDescription>{job.status?.active ? 'True' : 'False'}</DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>Status</DescriptionListTerm>
        <DescriptionListDescription>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              succeeded={job.status?.succeeded ? job.status?.succeeded : 0}
            </span>
          </div>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              failed={job.status?.failed ? job.status?.failed : 0}
            </span>
          </div>
        </DescriptionListDescription>
      </DescriptionListGroup>

      {job.spec?.selector && <Selector cluster={cluster} namespace={namespace} selector={job.spec.selector} />}
      {job.status?.conditions && <Conditions conditions={job.status.conditions} />}
    </React.Fragment>
  );
};

export default Job;
