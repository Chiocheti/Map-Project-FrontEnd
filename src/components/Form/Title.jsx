import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

export default function Title({ children }) {
  return (
    <Grid marginY={1}>
      <Divider textAlign="center">
        <Typography component="h2" variant="h6" textAlign="center">
          {children}
        </Typography>
      </Divider>
    </Grid>
  );
}
