import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { IRow } from '@patternfly/react-table';
import { V1Job } from '@kubernetes/client-node';

import { IResource } from '@kobsio/plugin-core';

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
  request: IResource;
  resource: IRow;
  show: boolean;
  setShow: (value: boolean) => void;
}

const CreateJob: React.FunctionComponent<ICreateJobProps> = ({ request, resource, show, setShow }: ICreateJobProps) => {
  const [error, setError] = useState<string>('');

  const jobName = `${
    resource.props && resource.props.metadata && resource.props.metadata.name ? resource.props.metadata.name : ''
  }-manual-${randomString(6)}`.toLowerCase();

  const handleCreateJob = async (): Promise<void> => {
    try {
      if (!resource.props) {
        throw new Error('Resource is not defined');
      }

      const job: V1Job = {
        apiVersion: 'batch/v1',
        kind: 'Job',
        metadata: {
          annotations: {
            'cronjob.kubernetes.io/instantiate': 'manual',
          },
          labels: {
            'job-name': jobName,
          },
          name: jobName,
          namespace: resource.props.metadata.namespace,
        },
        spec: {
          backoffLimit: resource.props.spec.jobTemplate.spec.backoffLimit,
          completions: resource.props.spec.jobTemplate.spec.completions,
          parallelism: resource.props.spec.jobTemplate.spec.parallelism,
          template: {
            metadata: {
              labels: {
                'job-name': jobName,
              },
            },
            spec: resource.props.spec.jobTemplate.spec.template.spec,
          },
        },
      };

      const response = await fetch(
        `/api/plugins/resources/resources?cluster=${resource.cluster.title}${
          resource.namespace ? `&namespace=${resource.namespace.title}` : ''
        }&resource=jobs&path=/apis/batch/v1`,
        {
          body: JSON.stringify(job),
          method: 'post',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      }
    } catch (err) {
      setShow(false);
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div style={{ height: '100%', minHeight: '100%' }}>
        <AlertGroup isToast={true}>
          <Alert
            isLiveRegion={true}
            variant={AlertVariant.danger}
            title={error}
            actionClose={<AlertActionCloseButton onClick={(): void => setError('')} />}
          />
        </AlertGroup>
      </div>
    );
  }

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
        Do you really want to trigger the CronJob <b>{resource.name.title}</b> (
        {resource.namespace ? `${resource.namespace.title} ${resource.cluster.title}` : resource.cluster.title})
        manually?
      </p>
    </Modal>
  );
};

export default CreateJob;
