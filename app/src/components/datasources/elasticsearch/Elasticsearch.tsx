import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Grid,
  GridItem,
  PageSection,
  PageSectionVariants,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import FilterIcon from '@patternfly/react-icons/dist/js/icons/filter-icon';

import { DatasourceLogsBucket, GetLogsRequest, GetLogsResponse } from 'generated/proto/datasources_pb';
import { IDocument, getFields } from 'components/datasources/elasticsearch/helpers';
import { ApplicationLogsQuery } from 'generated/proto/application_pb';
import Buckets from 'components/datasources/elasticsearch/Buckets';
import { DatasourcesPromiseClient } from 'generated/proto/datasources_grpc_web_pb';
import Document from 'components/datasources/elasticsearch/Document';
import Documents from 'components/datasources/elasticsearch/Documents';
import Fields from 'components/datasources/elasticsearch/Fields';
import { IDatasourceOptions } from 'utils/proto';
import Options from 'components/applications/details/metrics/Options';
import { apiURL } from 'utils/constants';
import { convertDatasourceOptionsToProto } from 'utils/proto';

const datasourcesService = new DatasourcesPromiseClient(apiURL, null, null);

// IQueryOptions is the interface for all query options. It extends the existing datasource options interface and adds
// a new query property.
interface IQueryOptions extends IDatasourceOptions {
  query: string;
  scrollID: string;
  selectedFields: string[];
}

// parseSearch parses the provided query parameters and returns a query options object. This is needed so that an user
// can share his current URL with other users. So that this URL must contain all properties provided by the user.
const parseSearch = (search: string): IQueryOptions => {
  const params = new URLSearchParams(search);
  const fields = params.get('fields');

  return {
    query: params.get('query') ? (params.get('query') as string) : '',
    scrollID: params.get('scrollID') ? (params.get('scrollID') as string) : '',
    selectedFields: fields ? fields.split(',') : [],
    timeEnd: params.get('timeEnd') ? parseInt(params.get('timeEnd') as string) : Math.floor(Date.now() / 1000),
    timeStart: params.get('timeStart')
      ? parseInt(params.get('timeStart') as string)
      : Math.floor(Date.now() / 1000) - 3600,
  };
};

export interface IElasticsearchProps {
  name: string;
}

// Elasticsearhc implements the Elasticsearch UI for kobs. It can be used to query a configured Elasticsearch instance
// and show the logs in a table.
const Elasticsearch: React.FunctionComponent<IElasticsearchProps> = ({ name }: IElasticsearchProps) => {
  const history = useHistory();
  const location = useLocation();
  const [query, setQuery] = useState<string>('');
  const [hits, setHits] = useState<number>(0);
  const [took, setTook] = useState<number>(0);
  const [scrollID, setScrollID] = useState<string>('');
  const [options, setOptions] = useState<IDatasourceOptions>();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [document, setDocument] = useState<IDocument>();
  const [buckets, setBuckets] = useState<DatasourceLogsBucket.AsObject[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // load changes the query parameters for the current page, to the user provided values. We change the query
  // parameters, instead of directly fetching the logs, so that a user can share his current view with other users.
  const load = async (): Promise<void> => {
    history.push({
      pathname: location.pathname,
      search: `?query=${query}&fields=${selectedFields.join(',')}&timeEnd=${options?.timeEnd}&timeStart=${
        options?.timeStart
      }`,
    });
  };

  // loadMore is called, when the user clicks the load more button. Instead to the normal load function we set the
  // scroll id as additional query parameter.
  const loadMore = async (): Promise<void> => {
    history.push({
      pathname: location.pathname,
      search: `?query=${query}&fields=${selectedFields.join(',')}&scrollID=${scrollID}&timeEnd=${
        options?.timeEnd
      }&timeStart=${options?.timeStart}`,
    });
  };

  // selectField adds the given field to the list of selected fields.
  const selectField = (field: string): void => {
    setSelectedFields((f) => [...f, field]);
  };

  // unselectField removes the given field from the list of selected fields.
  const unselectField = (field: string): void => {
    setSelectedFields(selectedFields.filter((f) => f !== field));
  };

  // fetchLogs call the getLogs function to retrieve the logs for a given query. If the scroll id is present in the
  // query options, we are fetching more logs for a query and adding the logs to the documents list. If the scroll id
  // isn't present we set the documents to the result list.
  // The returned logs are a string, but since we know that this is a Elasticsearch datasource, we can savely parse the
  // string into a JSON array.
  const fetchLogs = useCallback(
    async (queryOptions: IQueryOptions): Promise<void> => {
      try {
        if (queryOptions.query) {
          setIsLoading(true);
          const logsQuery = new ApplicationLogsQuery();
          logsQuery.setQuery(queryOptions.query);

          const getLogsRequest = new GetLogsRequest();
          getLogsRequest.setName(name);
          getLogsRequest.setScrollid(queryOptions.scrollID);
          getLogsRequest.setOptions(convertDatasourceOptionsToProto(queryOptions));
          getLogsRequest.setQuery(logsQuery);

          const getLogsResponse: GetLogsResponse = await datasourcesService.getLogs(getLogsRequest, null);

          if (queryOptions.scrollID === '') {
            const parsed = JSON.parse(getLogsResponse.getLogs());
            setFields(getFields(parsed.slice(parsed.length > 10 ? 10 : parsed.length)));
            setDocuments(parsed);
          } else {
            setDocuments((d) => [...d, ...JSON.parse(getLogsResponse.getLogs())]);
          }

          if (getLogsResponse.toObject().bucketsList.length > 0) {
            setBuckets(getLogsResponse.toObject().bucketsList);
          }

          setHits(getLogsResponse.getHits());
          setTook(getLogsResponse.getTook());
          setScrollID(getLogsResponse.getScrollid());
          setIsLoading(false);
          setError('');
        }
      } catch (err) {
        setIsLoading(false);
        setError(err.message);
      }
    },
    [name],
  );

  // useEffect is called every time, when the query parameters for the current location are changing. Then we parse the
  // query parameters, setting our states to the new values and finally we are calling the fetch logs function.
  useEffect(() => {
    const queryOptions = parseSearch(location.search);
    setQuery(queryOptions.query);
    setSelectedFields(queryOptions.selectedFields);
    setOptions(queryOptions);
    fetchLogs(queryOptions);
  }, [fetchLogs, location.search]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {name}
        </Title>

        <Toolbar id="elasticsearch-query-options" className="kobsio-pagesection-toolbar">
          <ToolbarContent>
            <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
              <ToolbarGroup style={{ width: '100%' }}>
                <ToolbarItem style={{ width: '100%' }}>
                  <TextInput
                    aria-label="Elasticsearch Query"
                    type="text"
                    value={query}
                    onChange={(value): void => setQuery(value)}
                  />
                </ToolbarItem>
                {options ? (
                  <ToolbarItem>
                    <Options type="elasticsearch" options={options} setOptions={(opts): void => setOptions(opts)} />
                  </ToolbarItem>
                ) : null}
                <ToolbarItem>
                  <Button
                    variant={ButtonVariant.primary}
                    spinnerAriaValueText={isLoading ? 'Loading' : undefined}
                    isLoading={isLoading}
                    onClick={load}
                  >
                    Run
                  </Button>
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarToggleGroup>
          </ToolbarContent>
        </Toolbar>
      </PageSection>

      <Drawer isExpanded={document !== undefined}>
        <DrawerContent
          panelContent={
            document ? <Document document={document} close={(): void => setDocument(undefined)} /> : undefined
          }
        >
          <DrawerContentBody>
            <PageSection className="kobs-drawer-pagesection" variant={PageSectionVariants.default}>
              {error ? (
                <Alert variant={AlertVariant.danger} isInline={false} title="Could not get logs">
                  <p>{error}</p>
                </Alert>
              ) : (
                <React.Fragment>
                  <Grid hasGutter={true}>
                    <GridItem sm={12} md={12} lg={3} xl={2} xl2={2}>
                      {fields.length > 0 || selectedFields.length > 0 ? (
                        <Fields
                          fields={fields}
                          selectedFields={selectedFields}
                          selectField={selectField}
                          unselectField={unselectField}
                        />
                      ) : null}
                    </GridItem>
                    <GridItem sm={12} md={12} lg={9} xl={10} xl2={10}>
                      {buckets.length > 0 ? <Buckets hits={hits} took={took} buckets={buckets} /> : null}

                      <p>&nbsp;</p>

                      {documents.length > 0 ? (
                        <Documents
                          selectedFields={selectedFields}
                          documents={documents}
                          select={(doc: IDocument): void => setDocument(doc)}
                        />
                      ) : null}

                      <p>&nbsp;</p>

                      {scrollID !== '' ? (
                        <Button
                          variant={ButtonVariant.primary}
                          spinnerAriaValueText={isLoading ? 'Loading' : undefined}
                          isBlock={true}
                          isLoading={isLoading}
                          onClick={loadMore}
                        >
                          Load more
                        </Button>
                      ) : null}
                    </GridItem>
                  </Grid>
                </React.Fragment>
              )}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Elasticsearch;
