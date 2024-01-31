import { TextField } from '@mui/material';

export default function TextInputToCard({ label, value }) {
  return (
    <TextField
      label={label}
      size="small"
      fullWidth
      value={value || ''}
      InputProps={{
        readOnly: true,
      }}
      variant="standard"
      InputLabelProps={{
        shrink: true,
      }}
    />
  );
}
