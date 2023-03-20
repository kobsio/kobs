import { forwardRef } from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

/**
 * `Link` is a helper function, which we need to use the `Link` (imported as `RouterLink`) component from React Router
 * within the `ListItem` component from Material UI.
 */
export const Link = forwardRef<HTMLAnchorElement, RouterLinkProps>(function link(itemProps, ref) {
  return <RouterLink ref={ref} {...itemProps} role="link" />;
});
