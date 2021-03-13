import { Alert, AlertVariant, Button } from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';

import { DatasourceLogsBucket, GetLogsRequest, GetLogsResponse } from 'generated/proto/datasources_pb';
import { ApplicationLogsQuery } from 'generated/proto/application_pb';
import Buckets from 'components/datasources/elasticsearch/Buckets';
import { DatasourcesPromiseClient } from 'generated/proto/datasources_grpc_web_pb';
import Documents from 'components/datasources/elasticsearch/Documents';
import { IDatasourceOptions } from 'utils/proto';
import { IDocument } from 'components/datasources/elasticsearch/helpers';
import { apiURL } from 'utils/constants';
import { convertDatasourceOptionsToProto } from 'utils/proto';

const datasourcesService = new DatasourcesPromiseClient(apiURL, null, null);

export interface IElasticsearchProps {
  query?: string;
  fields?: string[];
  datasourceName: string;
  datasourceType: string;
  datasourceOptions: IDatasourceOptions;
}

// Elasticsearhc implements the Elasticsearch UI for kobs. It can be used to query a configured Elasticsearch instance
// and show the logs in a table.
const Elasticsearch: React.FunctionComponent<IElasticsearchProps> = ({
  query,
  fields,
  datasourceName,
  datasourceType,
  datasourceOptions,
}: IElasticsearchProps) => {
  const [hits, setHits] = useState<number>(0);
  const [took, setTook] = useState<number>(0);
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [buckets, setBuckets] = useState<DatasourceLogsBucket.AsObject[]>([]);
  const [error, setError] = useState<string>('');

  // fetchLogs fetches the logs for a given query. For the applications view, we do not care about infinite scrolling.
  // When a user wants to see more then the fetched logs, he has to go to the datasource view.
  const fetchLogs = useCallback(async (): Promise<void> => {
    try {
      if (query) {
        const logsQuery = new ApplicationLogsQuery();
        logsQuery.setQuery(query);

        const getLogsRequest = new GetLogsRequest();
        getLogsRequest.setName(datasourceName);
        getLogsRequest.setScrollid('');
        getLogsRequest.setOptions(convertDatasourceOptionsToProto(datasourceOptions));
        getLogsRequest.setQuery(logsQuery);

        const getLogsResponse: GetLogsResponse = await datasourcesService.getLogs(getLogsRequest, null);

        const parsed = JSON.parse(getLogsResponse.getLogs());
        if (parsed.length === 0) {
          throw new Error('No documents were found');
        } else {
          if (getLogsResponse.toObject().bucketsList.length > 0) {
            setBuckets(getLogsResponse.toObject().bucketsList);
          }

          setDocuments(parsed);
          setHits(getLogsResponse.getHits());
          setTook(getLogsResponse.getTook());
          setError('');
        }
      }
    } catch (err) {
      setError(err.message);
    }
  }, [query, datasourceName, datasourceOptions]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <React.Fragment>
      {error ? (
        <React.Fragment>
          <p>&nbsp;</p>
          <Alert variant={AlertVariant.danger} isInline={true} title="Could not get logs">
            <p>{error}</p>
          </Alert>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <p>&nbsp;</p>

          {buckets.length > 0 ? <Buckets hits={hits} took={took} buckets={buckets} /> : null}

          <p>&nbsp;</p>

          {documents.length > 0 ? (
            <Documents selectedFields={fields ? fields : []} documents={documents} select={undefined} />
          ) : null}

          <p>&nbsp;</p>

          <Button
            component="a"
            href={`/datasources/${datasourceType}/${datasourceName}?query=${query}${
              fields ? `&fields=${fields.join(',')}` : ''
            }&timeEnd=${datasourceOptions.timeEnd}&timeStart=${datasourceOptions.timeStart}`}
            variant="primary"
            isBlock={true}
            target="_blank"
          >
            Details
          </Button>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default Elasticsearch;
