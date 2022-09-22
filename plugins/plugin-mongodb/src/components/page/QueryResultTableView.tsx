import {
  BSONRegExp,
  BSONSymbol,
  Binary,
  Document as BsonDocument,
  Code,
  DBRef,
  Decimal128,
  Double,
  EJSON,
  Int32,
  Long,
  MaxKey,
  MinKey,
  ObjectID,
  ObjectId,
  Timestamp,
  UUID,
} from 'bson';
import { TreeView, TreeViewDataItem } from '@patternfly/react-core';
import React from 'react';

export interface IQueryResultTreeViewProps {
  data: EJSON.SerializableTypes;
}

interface IDocumentProperty {
  children: IDocumentProperty[];
  id: number;
  propertyName: string | number | null;
  propertySerialValue: string;
  propertyTypeName: string;
  propertyValue: EJSON.SerializableTypes;
}

const QueryResultTableView: React.FunctionComponent<IQueryResultTreeViewProps> = ({
  data,
}: IQueryResultTreeViewProps) => {
  const [state, setState] = React.useState<{
    activeItems: TreeViewDataItem[];
  }>({ activeItems: [] });

  const onSelect = (event: React.MouseEvent, item: TreeViewDataItem, parentItem: TreeViewDataItem): void => {
    setState({
      activeItems: [item],
    });
  };

  let id = 0;

  const asTreeItem = (item: EJSON.SerializableTypes, propertyName: string | number): IDocumentProperty => {
    if (Array.isArray(item))
      return {
        children: item.map(asTreeItem),
        id: id++,
        propertyName: propertyName,
        propertySerialValue: 'Array',
        propertyTypeName: 'Array',
        propertyValue: item,
      };

    if (canBeRenderedAsValue(item))
      return {
        children: [],
        id: id++,
        propertyName: propertyName,
        propertySerialValue: renderValue(item),
        propertyTypeName: getTypeName(item),
        propertyValue: item,
      };

    return {
      children: Object.entries(item as BsonDocument).map(([key, value]) => asTreeItem(value, key)),
      id: id++,
      propertyName: propertyName,
      propertySerialValue: renderValue(item),
      propertyTypeName: getTypeName(item),
      propertyValue: item,
    };
  };

  const toTreeViewDataItem = (item: IDocumentProperty): TreeViewDataItem => ({
    children: item.children.length === 0 ? undefined : item.children.map(toTreeViewDataItem),
    customBadgeContent: item.propertyTypeName,
    id: `${item.id}`,
    name: item.propertySerialValue,
    title: item.propertyName,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canBeRenderedAsValue = (value: any): boolean =>
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
    value instanceof Date;

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
  const renderValue = (value: any): string => {
    if (value === null) return 'null';
    if (value instanceof Binary) return `Binary("${value.toString()}")`;
    if (value instanceof Code) return `Code("${value.toString()}")`;
    if (value instanceof DBRef) return `DBRef("${value.toString()}")`;
    if (value instanceof Decimal128) return `Decimal128("${value.toString()}")`;
    if (value instanceof Double) return `Double("${value.toString()}")`;
    if (value instanceof Int32) return `Int32("${value.toString()}")`;
    if (value instanceof Long) return `Long("${value.toString()}")`;
    if (value instanceof UUID) return `UUID("${value.toString()}")`;
    if (value instanceof MaxKey) return `MaxKey("${value.toString()}")`;
    if (value instanceof MinKey) return `MinKey("${value.toString()}")`;
    if (value instanceof ObjectId) return `ObjectId("${value.toString()}")`;
    if (value instanceof ObjectID) return `ObjectID("${value.toString()}")`;
    if (value instanceof BSONRegExp) return `BSONRegExp("${value.toString()}")`;
    if (value instanceof BSONSymbol) return `BSONSymbol("${value.toString()}")`;
    if (value instanceof Timestamp) return `Timestamp("${value.toString()}")`;
    if (value instanceof Date) return `Date("${value.toString()}")`;
    return value.toString();
  };

  return (
    <React.Fragment>
      {data !== null && Array.isArray(data) ? (
        <TreeView
          data={data.map(asTreeItem).map(toTreeViewDataItem)}
          activeItems={state.activeItems}
          onSelect={onSelect}
          hasBadges={true}
          hasGuides={true}
          variant="compact"
        />
      ) : (
        <div></div>
      )}
    </React.Fragment>
  );
};

export default QueryResultTableView;
