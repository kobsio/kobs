import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '@patternfly/react-core';
import React from 'react';
import { V1beta1CronJob } from '@kubernetes/client-node';

import { timeDifference } from '@kobsio/shared';

interface ICronJobProps {
  cronJob: V1beta1CronJob;
}

const CronJob: React.FunctionComponent<ICronJobProps> = ({ cronJob }: ICronJobProps) => {
  return (
    <React.Fragment>
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
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              success={cronJob.spec?.successfulJobsHistoryLimit ? cronJob.spec?.successfulJobsHistoryLimit : 0}
            </span>
          </div>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              failed={cronJob.spec?.failedJobsHistoryLimit ? cronJob.spec?.failedJobsHistoryLimit : 0}
            </span>
          </div>
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
            {timeDifference(new Date().getTime(), new Date(cronJob.status.lastScheduleTime.toString()).getTime())}
            <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{`({cronJob.status.lastScheduleTime})`}</span>
          </DescriptionListDescription>
        ) : (
          <DescriptionListDescription>-</DescriptionListDescription>
        )}
      </DescriptionListGroup>
    </React.Fragment>
  );
};

export default CronJob;
