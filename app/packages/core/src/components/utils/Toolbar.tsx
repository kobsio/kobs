import { Box, useMediaQuery, useTheme } from '@mui/material';
import { FunctionComponent, ReactNode } from 'react';

interface IToolbarItemsProps {
  align?: 'left' | 'right';
  children: ReactNode;
  grow?: boolean;
  width?: string;
}

/**
 * The `ToolbarItem` component lets us specify an item for the `Toolbar` component. We can define the width of an item,
 * the `grow` property can be used when the item should take all the remaining space and the `align` prop can be
 * used to move the item to the right in the toolbar.
 */
export const ToolbarItem: FunctionComponent<IToolbarItemsProps> = ({ align = 'left', children, grow, width }) => {
  return (
    <Box
      sx={{
        flexGrow: grow ? 1 : undefined,
        textAlign: align,
        width: width ? width : undefined,
      }}
    >
      {children}
    </Box>
  );
};

interface IToolbarProps {
  children: ReactNode;
}

/**
 * The `Toolbar` component is used to render a list of `ToolbarItems`. The toolbar is used to enforece a unique look
 * across the app. The component should be used within the `toolbar` property of the `Page` component.
 */
export const Toolbar: FunctionComponent<IToolbarProps> = ({ children }) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box sx={{ display: 'flex', flexDirection: isMdUp ? 'row' : 'column', flexWrap: 'wrap', gap: 3 }}>{children}</Box>
  );
};
