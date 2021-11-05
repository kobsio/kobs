import { AccordionContent, AccordionItem, AccordionToggle, Button, ButtonVariant } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IProject } from '../../utils/interfaces';
import Measures from '../panel/Measures';

interface IProjectsItemProps {
  name: string;
  project: IProject;
  url: string;
}

const ProjectsItem: React.FunctionComponent<IProjectsItemProps> = ({ name, project, url }: IProjectsItemProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <AccordionItem>
      <AccordionToggle id={project.key} onClick={(): void => setExpanded(!expanded)} isExpanded={expanded}>
        {project.name}
      </AccordionToggle>
      <AccordionContent id={project.key} isHidden={!expanded} isFixed={false}>
        <Measures name={name} project={project.key} />
        {url && (
          <Button
            className="pf-u-mt-sm pf-u-mb-sm"
            style={{ float: 'right' }}
            component="a"
            href={`${url}/dashboard?id=${project.key}`}
            target="_blank"
            rel="noreferrer"
            variant={ButtonVariant.link}
          >
            Show in SonarQube
          </Button>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default ProjectsItem;
