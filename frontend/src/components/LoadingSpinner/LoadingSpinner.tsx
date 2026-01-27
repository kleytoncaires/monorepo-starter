import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function LoadingSpinner() {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        height: '100vh',
        justifyContent: 'center',
        width: '100vw',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
