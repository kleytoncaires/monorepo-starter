import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        justifyContent: 'space-between',
        mt: 2,
        pt: 2,
      }}
    >
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Itens por página:
        </Typography>
        <FormControl size="small">
          <Select
            value={limit}
            onChange={e => onLimitChange(Number(e.target.value))}
            sx={{ minWidth: 70 }}
          >
            {ITEMS_PER_PAGE_OPTIONS.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {total > 0 ? `${startItem}-${endItem} de ${total}` : '0 resultados'}
        </Typography>

        <Box sx={{ alignItems: 'center', display: 'flex', ml: 1 }}>
          <IconButton
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            size="small"
            title="Primeira página"
          >
            <ChevronsLeft size={18} />
          </IconButton>
          <IconButton
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            size="small"
            title="Página anterior"
          >
            <ChevronLeft size={18} />
          </IconButton>
          <Typography variant="body2" sx={{ mx: 1, minWidth: 80, textAlign: 'center' }}>
            Página {page} de {totalPages || 1}
          </Typography>
          <IconButton
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            size="small"
            title="Próxima página"
          >
            <ChevronRight size={18} />
          </IconButton>
          <IconButton
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            size="small"
            title="Última página"
          >
            <ChevronsRight size={18} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
