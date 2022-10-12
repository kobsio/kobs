import {
  BSONRegExp,
  BSONSymbol,
  Binary,
  Code,
  DBRef,
  Decimal128,
  Double,
  Int32,
  Long,
  MaxKey,
  MinKey,
  ObjectID,
  ObjectId,
  Timestamp,
  UUID,
} from 'bson';
import React, { useState } from 'react';
import { TableComposable, TableText, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

interface IFindDocumentDetailsTreeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documentKey: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documentValue: any;
}

const FindDocumentDetailsTree: React.FunctionComponent<IFindDocumentDetailsTreeProps> = ({
  documentKey,
  documentValue,
}: IFindDocumentDetailsTreeProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canBeRenderedAsValue = (value: any): boolean => {
    return (
      value === null ||
      ['string', 'number', 'boolean'].some((type) => typeof value === type) ||
      value instanceof Binary ||
      value instanceof Code ||
      value instanceof DBRef ||
      value instanceof Decimal128 ||
      value instanceof Double ||
      value instanceof Int32 ||
      value instanceof Long ||
      value instanceof UUID ||
      value instanceof MaxKey ||
      value instanceof MinKey ||
      value instanceof ObjectId ||
      value instanceof ObjectID ||
      value instanceof BSONRegExp ||
      value instanceof BSONSymbol ||
      value instanceof Timestamp ||
      value instanceof Date
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getTypeName = (value: any): string => {
    if (value === null) return 'null';
    if (value instanceof Binary) return 'Binary';
    if (value instanceof Code) return 'Code';
    if (value instanceof DBRef) return 'DBRef';
    if (value instanceof Decimal128) return 'Decimal128';
    if (value instanceof Double) return 'Double';
    if (value instanceof Int32) return 'Int32';
    if (value instanceof Long) return 'Long';
    if (value instanceof UUID) return 'UUID';
    if (value instanceof MaxKey) return 'MaxKey';
    if (value instanceof MinKey) return 'MinKey';
    if (value instanceof ObjectId) return 'ObjectId';
    if (value instanceof ObjectID) return 'ObjectID';
    if (value instanceof BSONRegExp) return 'BSONRegExp';
    if (value instanceof BSONSymbol) return 'BSONSymbol';
    if (value instanceof Timestamp) return 'Timestamp';
    if (value instanceof Date) return 'Date';
    return typeof value;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatValue = (value: any): React.ReactNode => {
    if (canBeRenderedAsValue(value)) {
      return (
        <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="Value">
          <TableText wrapModifier="nowrap">
            {value?.toString() ?? 'null'}
            <small className="pf-u-ml-sm"> ({getTypeName(value)})</small>
          </TableText>
        </Td>
      );
    }

    return (
      <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="Document">
        <div className="kobsio-mongodb-document-preview">
          {Object.keys(value).map((key) => (
            <span key={key} className="pf-u-mr-sm pf-u-mb-sm">
              <span className="pf-u-background-color-200 pf-u-p-xs">{key}:</span>
              <span className="pf-u-p-xs"> {value[key]?.toString() ?? 'null'}</span>
            </span>
          ))}
        </div>
      </Td>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDetails = (value: any): React.ReactNode => {
    if (canBeRenderedAsValue(value)) {
      return (
        <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="Value">
          <TableText wrapModifier="nowrap">
            {value?.toString() ?? 'null'}
            <small className="pf-u-ml-sm"> ({getTypeName(value)})</small>
          </TableText>
        </Td>
      );
    }

    return (
      <TableComposable aria-label="Document Data" variant={TableVariant.compact} borders={true}>
        <Thead>
          <Tr>
            <Th />
            <Th>Key</Th>
            <Th>Value</Th>
          </Tr>
        </Thead>
        {Object.keys(value).map((key) => (
          <FindDocumentDetailsTree
            key={value[key]?.toString() ?? 'null'}
            documentKey={key}
            documentValue={value[key]}
          />
        ))}
      </TableComposable>
    );
  };

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr>
        <Td
          noPadding={true}
          style={{ padding: 0 }}
          expand={
            canBeRenderedAsValue(documentValue)
              ? undefined
              : { isExpanded: isExpanded, onToggle: (): void => setIsExpanded(!isExpanded), rowIndex: 0 }
          }
        />
        <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="Key">
          <TableText wrapModifier="nowrap">{documentKey?.toString() ?? 'null'}</TableText>
        </Td>
        {formatValue(documentValue)}
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td />
        <Td colSpan={2}>{isExpanded && formatDetails(documentValue)}</Td>
      </Tr>
    </Tbody>
  );
};

export default FindDocumentDetailsTree;
