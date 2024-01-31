import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import SaveIcon from '@mui/icons-material/Save';
import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import { forwardRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from './Button';

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

export default function NoSaveWarningDialog({ isOpen, closeDialog, path }) {
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: null,
    severity: null,
  });

  const navigate = useNavigate();

  function handleCloseSnackbar(event, reason) {
    if (reason === 'clickaway') return;

    setSnackbarState({
      open: false,
      message: null,
    });
  }

  return (
    <>
      <Dialog
        open={isOpen}
        TransitionComponent={Transition}
        keepMounted
        maxWidth="xs"
        fullWidth
        onClose={() => {
          closeDialog();
        }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>SAIR SEM SALVAR</DialogTitle>

        <DialogContent sx={{ mt: 1, mb: 1, p: 2 }}>
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={12} md={12} textAlign="center" sx={{ mb: 5 }}>
              <Typography>DESEJA SALVAR O SEU TRABALHO ?</Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={6} textAlign="center">
              <Button onClick={closeDialog} color="success" variant="contained" startIcon={<SaveIcon />}>
                FECHAR E SALVAR
              </Button>
            </Grid>
            <Grid item xs={6} sm={6} md={6} textAlign="center">
              <Button
                onClick={() => {
                  navigate(path);
                  closeDialog();
                }}
                color="error"
                variant="contained"
                startIcon={<DoNotDisturbAltIcon />}
              >
                SAIR SEM SALVAR
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={snackbarState.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarState.severity}>
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </>
  );
}
