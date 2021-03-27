import { Button, ButtonVariant, Grid, GridItem } from '@patternfly/react-core';
import React from 'react';

import { Bucket } from 'proto/elasticsearch_grpc_web_pb';
import ElasticsearchLogsBuckets from 'plugins/elasticsearch/ElasticsearchLogsBuckets';
import ElasticsearchLogsDocument from 'plugins/elasticsearch/ElasticsearchLogsDocument';
import ElasticsearchLogsDocuments from 'plugins/elasticsearch/ElasticsearchLogsDocuments';
import ElasticsearchLogsFields from 'plugins/elasticsearch/ElasticsearchLogsFields';
import { IDocument } from 'plugins/elasticsearch/helpers';

// IElasticsearchLogsGridProps is the interface for all required properties for the ElasticsearchLogsGrid component.
interface IElasticsearchLogsGridProps {
  name: string;
  queryName: string;
  buckets: Bucket.AsObject[];
  documents: IDocument[];
  fields: string[];
  hits: number;
  query: string;
  scrollID: string;
  selectedFields: string[];
  timeEnd: number;
  timeStart: number;
  took: number;
  setDocument: (document: React.ReactNode) => void;
  setScrollID: (scrollID: string) => void;
  selectField?: (field: string) => void;
}

// ElasticsearchLogsGrid renders a grid, for the Elasticsearch results. The grid contains a list of fields and selected
// fields, a header with the distribution of the log lines accross the selected time range, a table with the log lines
// and a load more button.
const ElasticsearchLogsGrid: React.FunctionComponent<IElasticsearchLogsGridProps> = ({
  name,
  queryName,
  buckets,
  documents,
  fields,
  hits,
  query,
  scrollID,
  selectedFields,
  timeEnd,
  timeStart,
  took,
  setDocument,
  setScrollID,
  selectField,
}: IElasticsearchLogsGridProps) => {
  // showFields is used to define if we want to show the fields list in the grid or not. If the queryName isn't present,
  // which can only happen in the page view, we show the logs. In that way we can save some space in the plugin view,
  // where a user can select the fields via the Application CR.
  const showFields = !queryName && selectField ? true : false;

  return (
    <Grid hasGutter={true}>
      {showFields ? (
        <GridItem sm={12} md={12} lg={3} xl={2} xl2={2}>
          {(fields.length > 0 || selectedFields.length > 0) && selectField ? (
            <ElasticsearchLogsFields fields={fields} selectedFields={selectedFields} selectField={selectField} />
          ) : null}
        </GridItem>
      ) : null}
      <GridItem sm={12} md={12} lg={9} xl={showFields ? 10 : 12} xl2={showFields ? 10 : 12}>
        <ElasticsearchLogsBuckets
          name={name}
          queryName={queryName}
          buckets={buckets}
          fields={selectedFields}
          hits={hits}
          query={query}
          timeEnd={timeEnd}
          timeStart={timeStart}
          took={took}
        />

        <p>&nbsp;</p>

        {documents.length > 0 ? (
          <ElasticsearchLogsDocuments
            selectedFields={selectedFields}
            documents={documents}
            select={(doc: IDocument): void =>
              setDocument(<ElasticsearchLogsDocument document={doc} close={(): void => setDocument(undefined)} />)
            }
          />
        ) : null}

        <p>&nbsp;</p>

        {scrollID !== '' && documents.length > 0 ? (
          <Button variant={ButtonVariant.primary} isBlock={true} onClick={(): void => setScrollID(scrollID)}>
            Load more
          </Button>
        ) : null}
      </GridItem>
    </Grid>
  );
};

export default ElasticsearchLogsGrid;
