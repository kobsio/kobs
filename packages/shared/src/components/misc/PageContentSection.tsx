import {
  Divider,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerSection,
  PageSection,
  Toolbar,
} from '@patternfly/react-core';
import React from 'react';

interface IPageContentSectionProps {
  panelContent: React.ReactNode;
  toolbarContent: React.ReactNode;
  children: React.ReactElement;
}

export const PageContentSection: React.FunctionComponent<IPageContentSectionProps> = ({
  panelContent,
  toolbarContent,
  children,
}: IPageContentSectionProps) => {
  return (
    <PageSection isFilled={true} padding={{ default: 'noPadding' }}>
      <Drawer isExpanded={panelContent !== undefined}>
        {toolbarContent && (
          <DrawerSection>
            <Toolbar usePageInsets={true}>{toolbarContent}</Toolbar>
            <Divider component="div" />
          </DrawerSection>
        )}
        <DrawerContent className="pf-m-no-background" panelContent={panelContent}>
          <DrawerContentBody hasPadding={true}>{children}</DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </PageSection>
  );
};
