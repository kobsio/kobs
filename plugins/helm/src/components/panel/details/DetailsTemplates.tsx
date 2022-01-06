import { Accordion, AccordionContent, AccordionItem, AccordionToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import yaml from 'js-yaml';

import { Editor } from '@kobsio/plugin-core';
import { IRelease } from '../../../utils/interfaces';

interface IDetailsTemplatesProps {
  release: IRelease;
}

const DetailsTemplates: React.FunctionComponent<IDetailsTemplatesProps> = ({ release }: IDetailsTemplatesProps) => {
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggle = (id: string): void => {
    if (expanded.includes(id)) {
      setExpanded(expanded.filter((item) => item !== id));
    } else {
      setExpanded([...expanded, id]);
    }
  };

  return (
    <Accordion asDefinitionList={false}>
      <AccordionItem>
        <AccordionToggle
          onClick={(): void => toggle('values.yaml')}
          isExpanded={expanded.includes('values.yaml')}
          id={'values.yaml'}
        >
          values.yaml
        </AccordionToggle>
        <AccordionContent
          id={'values.yaml'}
          style={{ maxWidth: '100%', overflowX: 'scroll' }}
          isHidden={!expanded.includes('values.yaml')}
          isFixed={false}
        >
          <Editor value={yaml.dump(release.chart?.values)} mode="yaml" readOnly={true} />
        </AccordionContent>
      </AccordionItem>

      {release.chart?.templates.map((template) => (
        <AccordionItem key={template?.name}>
          <AccordionToggle
            onClick={(): void => toggle(template?.name || '')}
            isExpanded={expanded.includes(template?.name || '')}
            id={template?.name || ''}
          >
            {template?.name}
          </AccordionToggle>
          <AccordionContent
            id={template?.name || ''}
            style={{ maxWidth: '100%', overflowX: 'scroll' }}
            isHidden={!expanded.includes(template?.name || '')}
            isFixed={false}
          >
            <Editor value={atob(template?.data || '')} mode="yaml" readOnly={true} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default DetailsTemplates;
