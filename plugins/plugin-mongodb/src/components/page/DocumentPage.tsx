import { Alert, AlertActionLink, AlertVariant, Card, Flex, FlexItem, Spinner } from '@patternfly/react-core';
import { Document, EJSON } from 'bson';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import { TableComposable, TableVariant, Th, Thead, Tr } from '@patternfly/react-table';
import { useLocation, useParams } from 'react-router-dom';
import React from 'react';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import FindDocument from '../panel/FindDocument';
import { defaultDescription } from '../../utils/constants';

interface IDocumentPageParams extends Record<string, string | undefined> {
  collectionName?: string;
}

interface IDocumentPageProps {
  instance: IPluginInstance;
}

const DocumentPage: React.FunctionComponent<IDocumentPageProps> = ({ instance }: IDocumentPageProps) => {
  const params = useParams<IDocumentPageParams>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const { isError, isLoading, data, error, refetch } = useQuery<Document[], Error>(
    ['mongodb/collections/document', instance, params.collectionName, searchParams.get('filter')],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/mongodb/collections/findone?collectionName=${params.collectionName}&filter=${encodeURIComponent(
            searchParams.get('filter') ?? '',
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
            return EJSON.parse(JSON.stringify(json));
          }

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
    <React.Fragment>
      <PageHeaderSection
        component={
          <PluginPageTitle
            satellite={instance.satellite}
            name={instance.name}
            description={instance.description || defaultDescription}
          />
        }
      />
      <PageContentSection hasPadding={true} hasDivider={true} toolbarContent={undefined} panelContent={undefined}>
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            {isLoading ? (
              <div className="pf-u-text-align-center">
                <Spinner />
              </div>
            ) : isError ? (
              <Alert
                variant={AlertVariant.danger}
                isInline={false}
                title="Could not get document"
                actionLinks={
                  <React.Fragment>
                    <AlertActionLink onClick={(): Promise<QueryObserverResult<Document[], Error>> => refetch()}>
                      Retry
                    </AlertActionLink>
                  </React.Fragment>
                }
              >
                <p>{error?.message}</p>
              </Alert>
            ) : data ? (
              <Card>
                <TableComposable aria-label="Documents" variant={TableVariant.compact} borders={true}>
                  <Thead>
                    <Tr>
                      <Th />
                      <Th>ID</Th>
                      <Th>Document</Th>
                      <Th />
                    </Tr>
                  </Thead>
                  <FindDocument instance={instance} collectionName={params.collectionName ?? ''} document={data} />
                </TableComposable>
              </Card>
            ) : (
              <div></div>
            )}
          </FlexItem>
        </Flex>
      </PageContentSection>
    </React.Fragment>
  );
};

export default DocumentPage;
