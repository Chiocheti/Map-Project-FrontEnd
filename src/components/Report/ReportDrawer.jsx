import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState } from 'react';

import Button from '../Form/Button';
import NavigationBar from '../Form/NavigationBar';
import ReportAllAssociationHistory from './ReportAllAssociationHistory';
import ReportAllBills from './ReportAllBills';
import ReportAllContracts from './ReportAllContracts';
import ReportAllRefunds from './ReportAllRefunds';
import ReportAllTxTFile from './ReportAllTxTFile';
import CompDialog from './ReportDialog2';

export default function ReportDrawer({
  billingPriorities,
  snackbar,
  isOpen,
  closeDrawer,
  isEdit,
  setShowPersonalInformation,
  setSnackbarState,
  amount,
  canEdit,
  banks,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function toggleIsDialogOpen() {
    setIsDialogOpen((previousValue) => !previousValue);
  }

  const banksList = [];

  if (banks) {
    banks.forEach((bank) => {
      banksList.push({ text: bank.bank, value: bank.id });
    });
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
      <CompDialog
        snackbar={snackbar}
        closeDrawer={closeDrawer}
        isOpen={isDialogOpen}
        closeDialog={toggleIsDialogOpen}
        billingPriorities={billingPriorities}
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

        <Paper
          sx={{
            p: 2,
            mb: 1,
            bgcolor: 'background.paper',
            overflow: 'auto',
          }}
        >
          <Grid container spacing={1}>
            <Grid item xs={12} sm={12} md={12}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setShowPersonalInformation((previousValue) => !previousValue)}
              >
                Buscar informações Pessoais
              </Button>
            </Grid>
          </Grid>

          <ReportAllTxTFile canEdit={canEdit} setSnackbarState={setSnackbarState} />
          <ReportAllAssociationHistory canEdit={canEdit} setSnackbarState={setSnackbarState} />
          <ReportAllBills canEdit={canEdit} setSnackbarState={setSnackbarState} banks={banksList} />
          <ReportAllRefunds canEdit={canEdit} setSnackbarState={setSnackbarState} amount={amount} />
          <ReportAllContracts canEdit={canEdit} setSnackbarState={setSnackbarState} />
        </Paper>
      </Box>
    </Drawer>
  );
}
