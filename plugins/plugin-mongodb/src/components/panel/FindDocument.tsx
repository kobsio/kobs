import { Document, ObjectID, ObjectId } from 'bson';
import React, { useState } from 'react';
import { TableText, Tbody, Td, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import { IPluginInstance, pluginBasePath } from '@kobsio/shared';
import FindDocumentDetails from './FindDocumentDetails';
import { toExtendedJson } from '../../utils/helpers';

import '../../assets/finddocument.css';

interface IFindDocumentProps {
  instance: IPluginInstance;
  collectionName: string;
  document: Document;
}

const FindDocument: React.FunctionComponent<IFindDocumentProps> = ({
  instance,
  collectionName,
  document,
}: IFindDocumentProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFilter = (value: any): string => {
    if (value instanceof ObjectId) return `{"_id": ObjectId("${value.toString()}")}`;
    if (value instanceof ObjectID) return `{"_id": ObjectID("${value.toString()}")}`;
    return `{"_id": "${value.toString()}"}`;
  };

  const defaultActions = [
    {
      title: (
        <Link
          style={{ color: 'inherit', textDecoration: 'inherit' }}
          to={`${pluginBasePath(instance)}/${collectionName}/document?filter=${encodeURIComponent(
            toExtendedJson(getFilter(document['_id'])),
          )}`}
        >
          View Document
        </Link>
      ),
    },
  ];

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr>
        <Td
          noPadding={true}
          style={{ padding: 0 }}
          expand={{ isExpanded: isExpanded, onToggle: (): void => setIsExpanded(!isExpanded), rowIndex: 0 }}
        />
        <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="ID">
          <TableText wrapModifier="nowrap">{document['_id'].toString()}</TableText>
        </Td>
        <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="Document">
          <div className="kobsio-mongodb-document-preview">
            {Object.keys(document)
              .filter((key) => key !== '_id')
              .map((key) => (
                <span key={key} className="pf-u-mr-sm pf-u-mb-sm">
                  <span className="pf-u-background-color-200 pf-u-p-xs">{key}:</span>
                  <span className="pf-u-p-xs"> {document[key].toString()}</span>
                </span>
              ))}
          </div>
        </Td>
        <Td noPadding={true} style={{ padding: 0 }} actions={{ items: defaultActions }} />
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td />
        <Td colSpan={2}>{isExpanded && <FindDocumentDetails document={document} />}</Td>
      </Tr>
    </Tbody>
  );
};

export default FindDocument;
