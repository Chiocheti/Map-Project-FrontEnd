import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

export default function AppBar({ children }) {
  return (
    <>
      <MuiAppBar
        position="fixed"
        enableColorOnDark
        elevation={0}
        color="transparent"
        sx={{ bgcolor: '#fff', borderBottom: '1px solid rgba(194, 224, 255, 0.08)' }}
      >
        <Toolbar>{children}</Toolbar>
      </MuiAppBar>
      <Toolbar />
    </>
  );
}
