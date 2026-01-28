import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <Box>
      <Box
        sx={{
          borderBottom: 2,
          borderColor: 'grey.100',
          display: 'flex',
          gap: 2,
          pb: 2,
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width={i === 0 ? 120 : 80} height={20} />
        ))}
      </Box>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box
          key={rowIndex}
          sx={{
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'grey.100',
            display: 'flex',
            gap: 2,
            py: 2,
          }}
        >
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 2, flex: 1 }}>
            <Skeleton variant="circular" width={36} height={36} />
            <Box>
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={160} height={16} />
            </Box>
          </Box>
          <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: 5 }} />
          <Skeleton variant="rounded" width={50} height={24} />
          <Skeleton variant="text" width={80} height={16} />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="circular" width={28} height={28} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
