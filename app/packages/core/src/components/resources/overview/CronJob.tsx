import { V1CronJob } from '@kubernetes/client-node';
import { Box, Chip } from '@mui/material';
import { FunctionComponent } from 'react';

import { timeDifference } from '../../../utils/times';
import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '../../utils/DescriptionList';

interface ICronJobProps {
  cronJob: V1CronJob;
}

const CronJob: FunctionComponent<ICronJobProps> = ({ cronJob }) => {
  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>Schedule</DescriptionListTerm>
        <DescriptionListDescription>{cronJob.spec?.schedule ? cronJob.spec?.schedule : '-'}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Suspend</DescriptionListTerm>
        <DescriptionListDescription>{cronJob.spec?.suspend ? 'True' : 'False'}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>History Limit</DescriptionListTerm>
        <DescriptionListDescription>
          <Chip
            size="small"
            label={`success=${cronJob.spec?.successfulJobsHistoryLimit ? cronJob.spec?.successfulJobsHistoryLimit : 0}`}
          />
          <Chip
            size="small"
            label={`failed=${cronJob.spec?.failedJobsHistoryLimit ? cronJob.spec?.failedJobsHistoryLimit : 0}`}
          />
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Active</DescriptionListTerm>
        <DescriptionListDescription>{cronJob.status?.active ? 'True' : 'False'}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Last Schedule</DescriptionListTerm>
        {cronJob.status?.lastScheduleTime ? (
          <DescriptionListDescription>
            <Box component="span">
              {timeDifference(new Date().getTime(), new Date(cronJob.status.lastScheduleTime.toString()).getTime())}
            </Box>
            <Box component="span" color="text.secondary">
              {`(${cronJob.status.lastScheduleTime})`}
            </Box>
          </DescriptionListDescription>
        ) : (
          <DescriptionListDescription>-</DescriptionListDescription>
        )}
      </DescriptionListGroup>
    </>
  );
};

export default CronJob;
