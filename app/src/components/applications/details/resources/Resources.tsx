import { Accordion, AccordionContent, AccordionItem, AccordionToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import CubesIcon from '@patternfly/react-icons/dist/js/icons/cubes-icon';

import { Application } from 'generated/proto/applications_pb';
import NotDefined from 'components/applications/details/NotDefined';
import Resource from 'components/applications/details/resources/Resource';
import { resources } from 'components/resources/shared/helpers';

interface IResourcesProps {
  application: Application;
}

// Resources is the component to show all resources, which are associated to the application. The resource are grouped
// by their kind in an accordion view.
const Resources: React.FunctionComponent<IResourcesProps> = ({ application }: IResourcesProps) => {
  const [expanded, setExpanded] = useState<string[]>([]);

  // toogle is used to show / hide a selected kind. When the kind is already present in the expanded state array it will
  // be removed. If not it will be added.
  const toggle = (id: string): void => {
    if (expanded.includes(id)) {
      setExpanded(expanded.filter((item) => item !== id));
    } else {
      setExpanded([...expanded, id]);
    }
  };

  // If the length of the resource list is zero, we will show the NotDefined component, with a link to the documentation
  // on how to define resources within the Application CR.
  if (application.getResourcesList().length === 0) {
    return (
      <NotDefined
        title="Resources are not defined"
        description="Resources are not defined in the CR for this application. Visit the documentation to learn more on how to define resources within the Application CR."
        documentation="https://kobs.io"
        icon={CubesIcon}
      />
    );
  }

  return (
    <Accordion asDefinitionList={false}>
      {application.getResourcesList().map((resource, i) => (
        <div key={i}>
          {resource.getKindsList().map((kind, j) => (
            <AccordionItem key={j}>
              <AccordionToggle
                onClick={(): void => toggle(`resources-accordion-${i}-${j}`)}
                isExpanded={expanded.includes(`resources-accordion-${i}-${j}`)}
                id={`resources-toggle-${i}-${j}`}
              >
                {resources[kind].title}
              </AccordionToggle>
              <AccordionContent
                id={`resources-content-${i}-${j}`}
                isHidden={!expanded.includes(`resources-accordion-${i}-${j}`)}
                isFixed={false}
              >
                <Resource
                  cluster={application.getCluster()}
                  namespace={application.getNamespace()}
                  kind={kind}
                  selector={resource.getSelector()}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </div>
      ))}
    </Accordion>
  );
};

export default Resources;
