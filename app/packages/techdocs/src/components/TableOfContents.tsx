import { IPluginInstance, pluginBasePath, Link } from '@kobsio/core';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import { FunctionComponent, useState } from 'react';

import { ITOCItem } from '../utils/utils';

const getTitle = (tocItem: ITOCItem): string => {
  const titles = Object.keys(tocItem);

  if (titles.length === 1) {
    return titles[0];
  }

  return '';
};

const TableOfContentsItem: FunctionComponent<{
  instance: IPluginInstance;
  level: number;
  service: string;
  setPath?: (path: string) => void;
  tocItem: ITOCItem;
}> = ({ level, instance, tocItem, service, setPath }) => {
  const [open, setOpen] = useState(false);
  const title = getTitle(tocItem);

  if (Array.isArray(tocItem[title])) {
    return (
      <>
        <ListItemButton sx={{ pl: 4 * level }} onClick={() => setOpen(!open)}>
          <ListItemText primary={title} />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={open} timeout="auto">
          <List component="div" disablePadding={true}>
            {(tocItem[title] as ITOCItem[]).map((nestedTOCItem, index) => (
              <TableOfContentsItem
                key={index}
                instance={instance}
                level={level + 1}
                tocItem={nestedTOCItem}
                service={service}
                setPath={setPath}
              />
            ))}
          </List>
        </Collapse>
      </>
    );
  }

  if (setPath) {
    return (
      <ListItemButton sx={{ pl: 4 * level }} onClick={() => setPath(tocItem[title] as string)}>
        {title}
      </ListItemButton>
    );
  }

  return (
    <ListItemButton
      sx={{ pl: 4 * level }}
      component={Link}
      to={`${pluginBasePath(instance)}/${service}?path=${encodeURIComponent(tocItem[title] as string)}`}
    >
      {title}
    </ListItemButton>
  );
};

export const TableOfContents: FunctionComponent<{
  instance: IPluginInstance;
  service: string;
  setPath?: (path: string) => void;
  toc: ITOCItem[];
}> = ({ instance, service, toc, setPath }) => {
  return (
    <List sx={{ bgcolor: 'background.paper', width: '100%' }}>
      {toc.map((tocItem, index) => (
        <TableOfContentsItem
          key={index}
          instance={instance}
          level={1}
          tocItem={tocItem}
          service={service}
          setPath={setPath}
        />
      ))}
    </List>
  );
};
