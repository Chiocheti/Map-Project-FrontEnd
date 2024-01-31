import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ContentPasteSearchOutlinedIcon from '@mui/icons-material/ContentPasteSearchOutlined';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import Fingerprint from '@mui/icons-material/Fingerprint';
import LogoutIcon from '@mui/icons-material/Logout';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { Grid } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../../contexts/AuthContext';
import NoSaveWarningDialog from './NoSaveWarningDialog';

export default function NavigationBar({ toggleIsDialogOpen, isEdit }) {
  const navigate = useNavigate();
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);

  const [path, setPath] = useState('');

  const {
    logout,
    user: { roles, ...user },
  } = useContext(AuthContext);

  function toggleWarningDialogOpen() {
    setWarningDialogOpen((previousValue) => !previousValue);
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.log(error);
    }
  }

  function canNavigate(link) {
    if (isEdit) {
      toggleWarningDialogOpen();
      setPath(link);
    } else {
      navigate(link);
    }
  }

  return (
    <>
      <NoSaveWarningDialog isOpen={warningDialogOpen} closeDialog={toggleWarningDialogOpen} path={path} />

      <Paper
        sx={{
          p: 2,
          mb: 2,
          bgcolor: 'background.paper',
          display: 'flex',
        }}
      >
        <Grid container>
          <Grid item xs={8} sm={8} md={8}>
            <Typography variant="h6" component="h2">
              {user?.name.split(' ', 1)}
            </Typography>
          </Grid>

          <Grid item xs={2} sm={2} md={2}>
            <Tooltip title="Configurações" arrow>
              <IconButton aria-label="fingerprint" color="warning" size="small" onClick={toggleIsDialogOpen}>
                <SettingsSuggestIcon />
              </IconButton>
            </Tooltip>
          </Grid>

          <Grid item xs={2} sm={2} md={2}>
            <Tooltip title="Sair" arrow>
              <IconButton aria-label="fingerprint" color="error" size="small" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Grid>

          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            sx={{ alignItems: 'center', justifyContent: 'space-between', display: 'flex' }}
          >
            {roles && roles.find((role) => role === 'Administrativo') ? (
              <Tooltip title="Administração" arrow>
                <IconButton
                  aria-label="fingerprint"
                  color="primary"
                  onClick={() => {
                    canNavigate('/admin');
                  }}
                >
                  <Fingerprint />
                </IconButton>
              </Tooltip>
            ) : null}

            {roles && roles.find((role) => role === 'Setor de Sócios') ? (
              <Tooltip title="Cadastro de Sócios" arrow>
                <IconButton
                  aria-label="fingerprint"
                  color="primary"
                  onClick={() => {
                    canNavigate('/form');
                  }}
                >
                  <ContentPasteSearchOutlinedIcon />
                </IconButton>
              </Tooltip>
            ) : null}

            {roles && roles.find((role) => role === 'Setor Médico') ? (
              <Tooltip title="Reembolso Médico" arrow>
                <IconButton
                  aria-label="fingerprint"
                  color="primary"
                  onClick={() => {
                    canNavigate('/refunds');
                  }}
                >
                  <MedicalServicesIcon />
                </IconButton>
              </Tooltip>
            ) : null}

            {roles && roles.find((role) => role === 'Financeiro') ? (
              <Tooltip title="Finanças" arrow>
                <IconButton
                  aria-label="fingerprint"
                  color="primary"
                  onClick={() => {
                    canNavigate('/financier');
                  }}
                >
                  <MonetizationOnOutlinedIcon />
                </IconButton>
              </Tooltip>
            ) : null}

            {roles && roles.find((role) => role === 'Setor de Serviços') ? (
              <Tooltip title="Serviços" arrow>
                <IconButton
                  aria-label="fingerprint"
                  color="primary"
                  onClick={() => {
                    canNavigate('/services');
                  }}
                >
                  <CardGiftcardIcon />
                </IconButton>
              </Tooltip>
            ) : null}

            {roles && roles.find((role) => role === 'Calendario') ? (
              <Tooltip title="Calendário" arrow>
                <IconButton
                  aria-label="fingerprint"
                  color="primary"
                  onClick={() => {
                    canNavigate('/calendar');
                  }}
                >
                  <CalendarMonthIcon />
                </IconButton>
              </Tooltip>
            ) : null}

            {roles && roles.find((role) => role === 'Relatório') ? (
              <Tooltip title="Relatório" arrow>
                <IconButton
                  aria-label="fingerprint"
                  color="primary"
                  onClick={() => {
                    canNavigate('/report');
                  }}
                >
                  <FindInPageIcon />
                </IconButton>
              </Tooltip>
            ) : null}
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
