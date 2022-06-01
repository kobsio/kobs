import { AccordionContent, AccordionItem, AccordionToggle, Button, ButtonVariant } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IPluginInstance } from '@kobsio/shared';
import { IProject } from '../../utils/interfaces';
import Measures from '../panel/Measures';

interface IProjectsItemProps {
  instance: IPluginInstance;
  project: IProject;
}

const ProjectsItem: React.FunctionComponent<IProjectsItemProps> = ({ instance, project }: IProjectsItemProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <AccordionItem>
      <AccordionToggle id={project.key} onClick={(): void => setExpanded(!expanded)} isExpanded={expanded}>
        {project.name}
      </AccordionToggle>
      <AccordionContent id={project.key} isHidden={!expanded} isFixed={false}>
        <Measures instance={instance} project={project.key} />
        {instance.options && instance.options.address && (
          <Button
            className="pf-u-mt-sm pf-u-mb-sm"
            style={{ float: 'right' }}
            component="a"
            href={`${instance.options.address}/dashboard?id=${project.key}`}
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
