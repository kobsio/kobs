import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardBody,
  Grid,
  GridItem,
  PageSection,
  PageSectionVariants,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import { IIndex, IMarkdown } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import ServicePageMarkdown from './ServicePageMarkdown';
import ServicePageTableOfContents from './ServicePageTableOfContents';
import TableOfContents from '../panel/TableOfContents';

interface IServicePageWrapperProps {
  instance: IPluginInstance;
  index: IIndex;
  path: string;
  setDetails?: (details: React.ReactNode) => void;
}

const ServicePageWrapper: React.FunctionComponent<IServicePageWrapperProps> = ({
  instance,
  index,
  path,
  setDetails,
}: IServicePageWrapperProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IMarkdown, Error>(
    ['techdocs/markdown', instance, index, path],
    async () => {
      try {
        const response = await fetch(`/api/plugins/techdocs/markdown?service=${index.key}&path=${path}`, {
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

  return (
    <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
      <Grid hasGutter={true}>
        <GridItem sm={12} md={12} lg={3} xl={2} xl2={2}>
          <Card style={{ width: '100%' }} isCompact={true}>
            <CardBody className="kobsio-hide-scrollbar" style={{ overflow: 'auto' }}>
              <TableOfContents instance={instance} service={index.key} toc={index.toc} />
            </CardBody>
          </Card>
        </GridItem>
        <GridItem sm={12} md={12} lg={3} xl={8} xl2={8}>
          {isLoading ? (
            <div className="pf-u-text-align-center">
              <Spinner />
            </div>
          ) : isError ? (
            <Alert
              variant={AlertVariant.danger}
              title="Could not get file"
              actionLinks={
                <React.Fragment>
                  <AlertActionLink onClick={(): Promise<QueryObserverResult<IMarkdown, Error>> => refetch()}>
                    Retry
                  </AlertActionLink>
                </React.Fragment>
              }
            >
              <p>{error?.message}</p>
            </Alert>
          ) : data && data.markdown ? (
            <ServicePageMarkdown
              instance={instance}
              index={index}
              path={path}
              markdown={data.markdown}
              setDetails={setDetails}
            />
          ) : null}
        </GridItem>
        <GridItem sm={12} md={12} lg={3} xl={2} xl2={2}>
          {data && data.toc && (
            <ServicePageTableOfContents instance={instance} index={index} path={path} toc={data.toc} />
          )}
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default ServicePageWrapper;
