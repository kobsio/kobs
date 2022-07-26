import {
  Alert,
  AlertActionLink,
  AlertVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Spinner,
  Text,
  Title,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import { IAlertDetails } from '../../../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import NoData from '../../NoData';

interface IDetailsProps {
  instance: IPluginInstance;
  id: string;
}

const Details: React.FunctionComponent<IDetailsProps> = ({ instance, id }: IDetailsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IAlertDetails, Error>(
    ['opsgenie/alerts/details', instance, id],
    async () => {
      try {
        const response = await fetch(`/api/plugins/opsgenie/alert/details?id=${id}`, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'get',
        });
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json;
        } else {
          if (json.error) {
            throw new Error(json.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    <Alert
      variant={AlertVariant.danger}
      isInline={true}
      title="Could not get alert details"
      actionLinks={
        <React.Fragment>
          <AlertActionLink onClick={(): Promise<QueryObserverResult<IAlertDetails, Error>> => refetch()}>
            Retry
          </AlertActionLink>
        </React.Fragment>
      }
    >
      <p>{error?.message}</p>
    </Alert>;
  }

  if (!data) {
    return <NoData title="Details not found" description="We could not find any details for the alert." />;
  }

  return (
    <div>
      <Title headingLevel="h6" size="md">
        Description
      </Title>

      {data.description ? (
        <Text className="pf-u-text-break-word" style={{ whiteSpace: 'pre-wrap' }}>
          {data.description}
        </Text>
      ) : null}

      <p>&nbsp;</p>
      <p>&nbsp;</p>

      <Title headingLevel="h6" size="md">
        Details
      </Title>

      {data.details ? (
        <DescriptionList className="pf-u-text-break-word">
          {Object.keys(data.details).map((detail) => (
            <DescriptionListGroup key={detail}>
              <DescriptionListTerm className="pf-u-text-nowrap">{detail}</DescriptionListTerm>
              <DescriptionListDescription>{data.details ? data.details[detail] : ''}</DescriptionListDescription>
            </DescriptionListGroup>
          ))}
        </DescriptionList>
      ) : null}
    </div>
  );
};

export default Details;
