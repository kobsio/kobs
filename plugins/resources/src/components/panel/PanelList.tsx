import { Accordion, AccordionContent, AccordionItem, AccordionToggle, Card } from '@patternfly/react-core';
import React, { useContext, useState } from 'react';

import { ClustersContext, IClusterContext } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/utils';
import PanelListItem from './PanelListItem';

interface IPanelListProps {
  resources: IPanelOptions[];
  showDetails?: (details: React.ReactNode) => void;
}

const PanelList: React.FunctionComponent<IPanelListProps> = ({ resources, showDetails }: IPanelListProps) => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggle = (id: string): void => {
    if (expanded.includes(id)) {
      setExpanded(expanded.filter((item) => item !== id));
    } else {
      setExpanded([...expanded, id]);
    }
  };

  return (
    <Card>
      <Accordion asDefinitionList={false}>
        {resources.map((resource, i) => (
          <div key={i}>
            {resource.resources.map((item, j) => (
              <AccordionItem key={j}>
                {clustersContext.resources && clustersContext.resources.hasOwnProperty(item) ? (
                  <React.Fragment>
                    <AccordionToggle
                      onClick={(): void => toggle(`resources-accordion-${i}-${j}`)}
                      isExpanded={expanded.includes(`resources-accordion-${i}-${j}`)}
                      id={`resources-toggle-${i}-${j}`}
                    >
                      {clustersContext.resources ? clustersContext.resources[item].title : ''}
                    </AccordionToggle>
                    <AccordionContent
                      id={`resources-content-${i}-${j}`}
                      style={{ maxWidth: '100%', overflowX: 'scroll' }}
                      isHidden={!expanded.includes(`resources-accordion-${i}-${j}`)}
                      isFixed={false}
                    >
                      {clustersContext.resources ? (
                        <PanelListItem
                          clusters={resource.clusters}
                          namespaces={resource.namespaces}
                          resource={clustersContext.resources[item]}
                          selector={resource.selector}
                          showDetails={showDetails}
                        />
                      ) : null}
                    </AccordionContent>
                  </React.Fragment>
                ) : (
                  <AccordionToggle id={`resources-toggle-${i}-${j}`}>Could not found resource {item}</AccordionToggle>
                )}
              </AccordionItem>
            ))}
          </div>
        ))}
      </Accordion>
    </Card>
  );
};

export default PanelList;
