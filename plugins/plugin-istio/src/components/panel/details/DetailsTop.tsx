import {
  Alert,
  AlertActionLink,
  AlertVariant,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import { convertMetrics, getDirection } from '../../../utils/helpers';
import DetailsTopChart from './DetailsTopChart';
import { ITopDetailsMetrics } from '../../../utils/interfaces';

interface IDetailsTopProps {
  instance: IPluginInstance;
  namespace: string;
  application: string;
  row: string[];
  times: ITimes;
  close: () => void;
}

const DetailsTop: React.FunctionComponent<IDetailsTopProps> = ({
  instance,
  namespace,
  application,
  row,
  times,
  close,
}: IDetailsTopProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<ITopDetailsMetrics, Error>(
    ['istio/topdetails', instance, namespace, application, row, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/istio/topdetails?timeStart=${times.timeStart}&timeEnd=${
            times.timeEnd
          }&application=${application}&namespace=${namespace}&upstreamCluster=${encodeURIComponent(
            row[0],
          )}&authority=${encodeURIComponent(row[1])}&method=${encodeURIComponent(row[1])}&path=${encodeURIComponent(
            row[2],
          )}`,
          {
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-plugin': instance.name,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-satellite': instance.satellite,
            },
            method: 'get',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          if (json) {
            return convertMetrics(json);
          }

          return {
            latency: [],
            sr: [],
          };
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

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {getDirection(row[0]) || '-'}: {row[0] || '-'}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
            {row[1] || '-'}: {row[2] || '-'}
          </span>
        </Title>
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        {isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Alert
            variant={AlertVariant.danger}
            isInline={true}
            title="Could not get metrics"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): Promise<QueryObserverResult<ITopDetailsMetrics, Error>> => refetch()}>
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data ? (
          <div>
            <DetailsTopChart title="Success Rate" unit="%" metrics={data.sr} times={times} />
            <p>&nbsp;</p>
            <DetailsTopChart title="Latency" unit="ms" metrics={data.latency} times={times} />
            <p>&nbsp;</p>
          </div>
        ) : null}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default DetailsTop;
