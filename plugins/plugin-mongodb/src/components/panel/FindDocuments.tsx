import { TableComposable, TableVariant, Th, Thead, Tr } from '@patternfly/react-table';
import { Document } from 'bson';
import React from 'react';

import FindDocument from './FindDocument';
import { IPluginInstance } from '@kobsio/shared';

interface IFindDocumentsProps {
  instance: IPluginInstance;
  collectionName: string;
  documents: Document[];
}

const FindDocuments: React.FunctionComponent<IFindDocumentsProps> = ({
  instance,
  collectionName,
  documents,
}: IFindDocumentsProps) => {
  return (
    <TableComposable aria-label="Documents" variant={TableVariant.compact} borders={true}>
      <Thead>
        <Tr>
          <Th />
          <Th>ID</Th>
          <Th>Document</Th>
          <Th />
        </Tr>
      </Thead>
      {documents.map((document) => (
        <FindDocument
          key={document['_id'].toString()}
          instance={instance}
          collectionName={collectionName}
          document={document}
        />
      ))}
    </TableComposable>
  );
};

export default FindDocuments;
