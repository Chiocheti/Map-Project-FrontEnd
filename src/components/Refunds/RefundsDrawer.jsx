import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState } from 'react';

import NavigationBar from '../Form/NavigationBar';
import RefundDialog from './RefundDialog';

export default function RefundsDrawer({ isOpen, closeDrawer, isEdit, setSnackbarState, canEdit }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function toggleIsDialogOpen() {
    setIsDialogOpen((previousValue) => !previousValue);
  }

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={() => {
        closeDrawer();
      }}
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
          backgroundImage: 'none',
        },
      }}
    >
      <RefundDialog
        isOpen={isDialogOpen}
        closeDialog={toggleIsDialogOpen}
        setSnackbarState={setSnackbarState}
        canEdit={canEdit}
      />

      <Box
        component="form"
        display="flex"
        flexDirection="column"
        padding={2}
        sx={{
          width: useMediaQuery('(min-width:900px)') ? '35vw' : '65vw',
          maxWidth: '32rem',
          minWidth: '18rem',
        }}
        overflow="hidden"
      >
        <NavigationBar toggleIsDialogOpen={toggleIsDialogOpen} isEdit={isEdit} />
      </Box>
    </Drawer>
  );
}
