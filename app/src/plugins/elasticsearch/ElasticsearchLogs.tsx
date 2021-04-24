import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';

import {
  Bucket,
  ElasticsearchPromiseClient,
  GetLogsRequest,
  GetLogsResponse,
  Query,
} from 'proto/elasticsearch_grpc_web_pb';
import { IDocument, IElasticsearchOptions, getFields } from 'plugins/elasticsearch/helpers';
import ElasticsearchLogsGrid from 'plugins/elasticsearch/ElasticsearchLogsGrid';
import { apiURL } from 'utils/constants';

// elasticsearchService is the gRPC service to get the logs from an Elasticsearch instance.
const elasticsearchService = new ElasticsearchPromiseClient(apiURL, null, null);

// IDataState is the interface for the state of the ElasticsearchLogs component. It contains all the results of an
// Elasticsearch query.
interface IDataState {
  buckets: Bucket.AsObject[];
  documents: IDocument[];
  error: string;
  fields: string[];
  hits: number;
  isLoading: boolean;
  scrollID: string;
  took: number;
}

// IElasticsearchLogsProps is the interface for the properties of the ElasticsearchLogs component, next to the options
// for an Elasticsearch query, we also need the name of the datasource, the name of the query and some other functions
// to modify the properties.
// The queryName is only present, when the query is executed via the ElasticsearchPlugin component, so that we can use
// this property to decide if the user is using Elasticsearch as plugin or via the plugin page.
interface IElasticsearchLogsProps extends IElasticsearchOptions {
  name: string;
  queryName: string;
  setDocument?: (document: React.ReactNode) => void;
  setScrollID: (scrollID: string) => void;
  selectField?: (field: string) => void;
}

// ElasticsearchLogs is a wrapper component for the Elasticsearch results view (ElasticsearchLogsGrid), it is used to
// fetch all requiered data. The query parameters are passed to this component via props.
const ElasticsearchLogs: React.FunctionComponent<IElasticsearchLogsProps> = ({
  name,
  queryName,
  fields,
  query,
  scrollID,
  timeEnd,
  timeStart,
  setDocument,
  setScrollID,
  selectField,
}: IElasticsearchLogsProps) => {
  const [data, setData] = useState<IDataState>({
    buckets: [],
    documents: [],
    error: '',
    fields: [],
    hits: 0,
    isLoading: true,
    scrollID: '',
    took: 0,
  });

  // fetchLogs is used to fetch the logs of for a given query in the selected time range. When the query was successful,
  // we have to check if a scroll id was already present, if this is the case the query was executed within a previous
  // query, so that we have to add the returned documents to the existing want. We also have to omit some other
  // properties in this case.
  const fetchLogs = useCallback(async (): Promise<void> => {
    try {
      if (!scrollID) {
        setData({
          buckets: [],
          documents: [],
          error: '',
          fields: [],
          hits: 0,
          isLoading: true,
          scrollID: '',
          took: 0,
        });
      }

      const q = new Query();
      q.setQuery(query);

      const getLogsRequest = new GetLogsRequest();
      getLogsRequest.setName(name);
      getLogsRequest.setScrollid(scrollID ? scrollID : '');
      getLogsRequest.setTimeend(timeEnd);
      getLogsRequest.setTimestart(timeStart);
      getLogsRequest.setQuery(q);

      const getLogsResponse: GetLogsResponse = await elasticsearchService.getLogs(getLogsRequest, null);
      const tmpLogsResponse = getLogsResponse.toObject();
      const parsedLogs = JSON.parse(tmpLogsResponse.logs);

      // When the scrollID isn't present, this was a new query, so that we have to set the documents, buckets, hits,
      // took and fields. The fields are generated via the getFields function, from the first 10 documents.
      // If the scrollID is present we just add the new documents to the existing one, and ignoring the other fields.
      if (!scrollID) {
        setData({
          buckets: tmpLogsResponse.bucketsList,
          documents: parsedLogs,
          error: '',
          fields: getFields(parsedLogs.slice(parsedLogs.length > 10 ? 10 : parsedLogs.length)),
          hits: tmpLogsResponse.hits,
          isLoading: false,
          scrollID: tmpLogsResponse.scrollid,
          took: tmpLogsResponse.took,
        });
      } else {
        setData((d) => {
          return {
            ...d,
            documents: [...d.documents, ...parsedLogs],
            error: '',
            isLoading: false,
            scrollID: tmpLogsResponse.scrollid,
          };
        });
      }
    } catch (err) {
      setData({
        buckets: [],
        documents: [],
        error: err.message,
        fields: [],
        hits: 0,
        isLoading: false,
        scrollID: '',
        took: 0,
      });
    }
  }, [name, query, scrollID, timeEnd, timeStart]);

  // useEffect is used to call the fetchLogs function every time the required props are changing.
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // When the isLoading property is true, we render a spinner as loading indicator for the user.
  if (data.isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  // In case of an error, we show an Alert component, with the error message, while the request failed.
  if (data.error) {
    return (
      <Alert
        variant={AlertVariant.danger}
        title="Could not get logs"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={fetchLogs}>Retry</AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{data.error}</p>
      </Alert>
    );
  }

  return (
    <ElasticsearchLogsGrid
      name={name}
      queryName={queryName}
      buckets={data.buckets}
      documents={data.documents}
      fields={data.fields}
      hits={data.hits}
      query={query}
      scrollID={data.scrollID}
      selectedFields={fields ? fields : []}
      timeEnd={timeEnd}
      timeStart={timeStart}
      took={data.took}
      setDocument={setDocument}
      setScrollID={setScrollID}
      selectField={selectField}
    />
  );
};

export default ElasticsearchLogs;
