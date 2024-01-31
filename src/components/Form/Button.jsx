import MuiButton from '@mui/material/Button';

export default function Button({ children, color, fullWidth = false, ...rest }) {
  return (
    <MuiButton variant="outlined" color={color} fullWidth={fullWidth} {...rest}>
      {children}
    </MuiButton>
  );
}
