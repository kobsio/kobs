import React, { useState } from 'react';
import { TableText, Tbody, Td, Tr } from '@patternfly/react-table';
import CollectionDetails from './CollectionDetails';
import { IPluginInstance } from '@kobsio/shared';
import { useLocation } from 'react-router-dom';

interface ICollectionItemProps {
  instance: IPluginInstance;
  collectionName: string;
}

const CollectionItem: React.FunctionComponent<ICollectionItemProps> = ({
  instance,
  collectionName,
}: ICollectionItemProps) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr>
        <Td
          noPadding={true}
          style={{ padding: 0 }}
          expand={{ isExpanded: isExpanded, onToggle: (): void => setIsExpanded(!isExpanded), rowIndex: 0 }}
        />
        <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="collectionName">
          <a href={`${location.pathname}/${encodeURIComponent(collectionName)}/query`}>
            <TableText>{collectionName}</TableText>
          </a>
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        {isExpanded && <CollectionDetails instance={instance} collectionName={collectionName} />}
      </Tr>
    </Tbody>
  );
};

export default CollectionItem;
