import { FunctionComponent } from 'react';

export const LayoutNew: FunctionComponent = () => {
  return <div></div>;
};

// // import { isWidthUp } from '@mui/core';
// import { Apps, Extension, Groups, Hive, Home, Subject } from '@mui/icons-material';
// import MenuIcon from '@mui/icons-material/Menu';
// // import { withWidth } from '@mui/material';
// import withWidth from '@mui/material';
// import isWidthUp from '@mui/material';
// import AppBar from '@mui/material/AppBar';
// import Box from '@mui/material/Box';
// import Divider from '@mui/material/Divider';
// import Drawer from '@mui/material/Drawer';
// import Hidden from '@mui/material/Hidden';
// import { useState } from 'react';

// const drawerWidth = 258;

// interface ILayoutProps {
//   children: React.ReactNode;
// }

// export const Layout: React.FunctionComponent<ILayoutProps> = ({ children }: ILayoutProps) => {
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const handleDrawerToggle = (): void => {
//     setMobileOpen(!mobileOpen);
//   };

//   return (
//     <Box sx={{ display: 'flex', minHeight: '100vh' }}>
//       <Drawer>
//         <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
//           <Sidebar
//             PaperProps={{ style: { width: drawerWidth } }}
//             variant="temporary"
//             open={sideBar.isOpen}
//             onClose={handleDrawerToggle}
//             items={appInfo.menus}
//           />
//         </Box>
//         <Box sx={{ display: { xs: 'none', md: 'block' } }}>
//           <Sidebar PaperProps={{ style: { width: drawerWidth } }} items={appInfo.menus} />
//         </Box>
//       </Drawer>
//       <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', maxWidth: '100%' }}>
//         <Header onDrawerToggle={handleDrawerToggle} />
//         <Box p={isWidthUp('lg', width) ? 12 : 5}>{children}</Box>
//       </Box>
//     </Box>
//   );
// };

// export default withWidth()(Layout);
