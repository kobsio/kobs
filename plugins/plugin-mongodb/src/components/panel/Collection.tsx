import { AccordionContent, AccordionItem, AccordionToggle } from '@patternfly/react-core';
import React, { useState } from 'react';

import CollectionDetails from './CollectionDetails';
import { IPluginInstance } from '@kobsio/shared';

interface ICollectionProps {
  instance: IPluginInstance;
  collectionName: string;
}

const Collection: React.FunctionComponent<ICollectionProps> = ({ instance, collectionName }: ICollectionProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <AccordionItem>
      <AccordionToggle
        onClick={(): void => {
          setIsExpanded(!isExpanded);
        }}
        isExpanded={isExpanded}
        id={collectionName}
      >
        {collectionName}
      </AccordionToggle>
      <AccordionContent id={collectionName} isHidden={!isExpanded}>
        <CollectionDetails instance={instance} collectionName={collectionName} />
      </AccordionContent>
    </AccordionItem>
  );
};

export default Collection;
