import { AlertVariant, Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import { V1CronJob, V1Job } from '@kubernetes/client-node';
import React from 'react';

import { IAlert } from '../../utils/interfaces';
import { IResource } from '../../../../resources/clusters';
import { IResourceRow } from '../../utils/tabledata';

export const randomString = (length: number): string => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

interface ICreateJobProps {
  resource: IResource;
  resourceData: IResourceRow;
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
}

const CreateJob: React.FunctionComponent<ICreateJobProps> = ({
  resource,
  resourceData,
  show,
  setShow,
  setAlert,
}: ICreateJobProps) => {
  const jobName = `${
    resourceData.props && resourceData.props.metadata && resourceData.props.metadata.name
      ? resourceData.props.metadata.name
      : ''
  }-manual-${randomString(6)}`.toLowerCase();

  const handleCreateJob = async (): Promise<void> => {
    try {
      if (!resourceData.props) {
        throw new Error('Resource is not defined');
      }

      const cronJob = resourceData.props as V1CronJob;

      const job: V1Job = {
        apiVersion: 'batch/v1',
        kind: 'Job',
        metadata: {
          annotations: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'cronjob.kubernetes.io/instantiate': 'manual',
          },
          labels: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'job-name': jobName,
          },
          name: jobName,
          namespace: resourceData.props.metadata.namespace,
        },
        spec: cronJob.spec?.jobTemplate.spec,
      };

      if (job.spec) {
        if (job.spec.template.metadata) {
          if (job.spec.template.metadata.labels) {
            job.spec.template.metadata.labels['job-name'] = jobName;
          }
        } else {
          job.spec.template.metadata = {
            labels: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'job-name': jobName,
            },
          };
        }
      }

      const response = await fetch(
        `/api/resources?satellite=${resourceData.satellite}&cluster=${resourceData.cluster}${
          resourceData.namespace ? `&namespace=${resourceData.namespace}` : ''
        }&resource=jobs&path=/apis/batch/v1`,
        {
          body: JSON.stringify(job),
          method: 'post',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
        setAlert({ title: `Job ${jobName} was created`, variant: AlertVariant.success });
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      }
    } catch (err) {
      setShow(false);
      setAlert({ title: err.message, variant: AlertVariant.danger });
    }
  };

  return (
    <Modal
      variant={ModalVariant.small}
      title={`Create Job ${jobName}`}
      isOpen={show}
      onClose={(): void => setShow(false)}
      actions={[
        <Button key="createJob" variant={ButtonVariant.primary} onClick={handleCreateJob}>
          Create Job
        </Button>,
        <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShow(false)}>
          Cancel
        </Button>,
      ]}
    >
      <p>
        Do you really want to trigger the CronJob <b>{resourceData.name}</b> (
        {resourceData.namespace ? `${resourceData.namespace} ${resourceData.cluster}` : resourceData.cluster}) manually?
      </p>
    </Modal>
  );
};

export default CreateJob;
