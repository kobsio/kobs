import { V1Job } from '@kubernetes/client-node';
import { Chip } from '@mui/material';
import { FunctionComponent } from 'react';

import Conditions from './Conditions';
import Selector from './Selector';

import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '../../utils/DescriptionList';

interface IJobProps {
  cluster: string;
  job: V1Job;
  namespace: string;
}

const Job: FunctionComponent<IJobProps> = ({ cluster, namespace, job }) => {
  return (
    <>
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
          <Chip size="small" label={`succeeded=${job.status?.succeeded ? job.status?.succeeded : 0}`} />
          <Chip size="small" label={`failed=${job.status?.failed ? job.status?.failed : 0}`} />
        </DescriptionListDescription>
      </DescriptionListGroup>

      {job.spec?.selector && <Selector cluster={cluster} namespace={namespace} selector={job.spec.selector} />}
      {job.status?.conditions && <Conditions conditions={job.status.conditions} />}
    </>
  );
};

export default Job;
