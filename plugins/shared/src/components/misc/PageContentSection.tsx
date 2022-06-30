import { Divider, Drawer, DrawerContent, DrawerContentBody, DrawerSection, PageSection } from '@patternfly/react-core';
import React from 'react';

interface IPageContentSectionProps {
  hasPadding: boolean;
  hasDivider: boolean;
  panelContent: React.ReactNode;
  toolbarContent: React.ReactNode;
  children: React.ReactElement;
}

export const PageContentSection: React.FunctionComponent<IPageContentSectionProps> = ({
  hasPadding,
  hasDivider,
  panelContent,
  toolbarContent,
  children,
}: IPageContentSectionProps) => {
  return (
    <PageSection isFilled={true} padding={{ default: 'noPadding' }}>
      <Drawer isExpanded={panelContent !== undefined}>
        {toolbarContent && <DrawerSection>{toolbarContent}</DrawerSection>}
        {hasDivider && <Divider component="div" />}
        <DrawerContent className="pf-m-no-background" panelContent={panelContent}>
          <DrawerContentBody hasPadding={hasPadding}>{children}</DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </PageSection>
  );
};
