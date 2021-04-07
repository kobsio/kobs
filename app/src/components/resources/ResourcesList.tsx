import { Accordion, AccordionContent, AccordionItem, AccordionToggle, Card } from '@patternfly/react-core';
import React, { useContext, useState } from 'react';
import { IRow } from '@patternfly/react-table';

import { ClustersContext, IClusterContext } from 'context/ClustersContext';
import { IResources } from 'components/resources/Resources';
import ResourcesListItem from 'components/resources/ResourcesListItem';

// IResourcesListProps is the interface for the properties of the ResourcesList component. It requires a resources,
// which contains a list of clusters and resources (kinds, namespaces and selector) a function, which is called when a
// resource is selected and a default namespace. The default namespace is the namespace of the application, when used
// within the ApplicationTabsContent component or an empty array when used within the Resources component, because we
// already check within this component that the props are correct (checkRequiredData function).
interface IResourcesListProps {
  defaultNamespaces: string[];
  resources: IResources;
  selectResource?: (resource: IRow) => void;
}

// ResourcesList is a list of resources. The resources are displayed in an accordion view.
const ResourcesList: React.FunctionComponent<IResourcesListProps> = ({
  defaultNamespaces,
  resources,
  selectResource,
}: IResourcesListProps) => {
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
        {resources.resources.map((resource, i) => (
          <div key={i}>
            {resource.kindsList.map((kind, j) => (
              <AccordionItem key={j}>
                {clustersContext.resources && clustersContext.resources.hasOwnProperty(kind) ? (
                  <React.Fragment>
                    <AccordionToggle
                      onClick={(): void => toggle(`resources-accordion-${i}-${j}`)}
                      isExpanded={expanded.includes(`resources-accordion-${i}-${j}`)}
                      id={`resources-toggle-${i}-${j}`}
                    >
                      {clustersContext.resources ? clustersContext.resources[kind].title : ''}
                    </AccordionToggle>
                    <AccordionContent
                      id={`resources-content-${i}-${j}`}
                      style={{ maxWidth: '100%', overflowX: 'scroll' }}
                      isHidden={!expanded.includes(`resources-accordion-${i}-${j}`)}
                      isFixed={false}
                    >
                      {clustersContext.resources ? (
                        <ResourcesListItem
                          clusters={resources.clusters}
                          namespaces={resource.namespacesList.length > 0 ? resource.namespacesList : defaultNamespaces}
                          resource={clustersContext.resources[kind]}
                          selector={resource.selector}
                          selectResource={selectResource}
                        />
                      ) : null}
                    </AccordionContent>
                  </React.Fragment>
                ) : (
                  <AccordionToggle id={`resources-toggle-${i}-${j}`}>Could not found resource {kind}</AccordionToggle>
                )}
              </AccordionItem>
            ))}
          </div>
        ))}
      </Accordion>
    </Card>
  );
};

export default ResourcesList;
