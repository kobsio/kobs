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
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IPluginTimes, Title } from '@kobsio/plugin-core';
import { convertMetrics, getDirection } from '../../../utils/helpers';
import DetailsTopChart from './DetailsTopChart';
import { ITopDetailsMetrics } from '../../../utils/interfaces';

interface IDetailsTopProps {
  name: string;
  namespace: string;
  application: string;
  row: string[];
  times: IPluginTimes;
  close: () => void;
}

const DetailsTop: React.FunctionComponent<IDetailsTopProps> = ({
  name,
  namespace,
  application,
  row,
  times,
  close,
}: IDetailsTopProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<ITopDetailsMetrics, Error>(
    ['istio/topdetails', name, namespace, application, row, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/istio/topdetails/${name}?timeStart=${times.timeStart}&timeEnd=${
            times.timeEnd
          }&application=${application}&namespace=${namespace}&upstreamCluster=${encodeURIComponent(
            row[0],
          )}&authority=${encodeURIComponent(row[1])}&method=${encodeURIComponent(row[1])}&path=${encodeURIComponent(
            row[2],
          )}`,
          {
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
        <Title
          title={`${getDirection(row[0]) || '-'}: ${row[0] || '-'}`}
          subtitle={`${row[1] || '-'}: ${row[2] || '-'}`}
          size="lg"
        />
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
            <DetailsTopChart title="Success Rate" unit="%" series={data.sr} times={times} />
            <p>&nbsp;</p>
            <DetailsTopChart title="Latency" unit="ms" series={data.latency} times={times} />
            <p>&nbsp;</p>
          </div>
        ) : null}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default DetailsTop;
