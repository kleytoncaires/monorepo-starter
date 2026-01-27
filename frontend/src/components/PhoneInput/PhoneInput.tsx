import MaskedInput from '@/components/MaskedInput';
import { masks } from '@/utils/masks';
import InputAdornment from '@mui/material/InputAdornment';
import type { TextFieldProps } from '@mui/material/TextField';
import { Phone } from 'lucide-react';
import { forwardRef } from 'react';
import { IMask } from 'react-imask';

type IMaskInput = ReturnType<typeof IMask>;

interface PhoneInputProps extends Omit<TextFieldProps, 'inputComponent'> {
  onAccept?: (value: string, maskRef: IMaskInput) => void;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(({ onAccept, ...props }, ref) => {
  return (
    <MaskedInput
      {...props}
      ref={ref}
      mask={masks.phone}
      onAccept={onAccept}
      slotProps={{
        ...props.slotProps,
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Phone size={20} />
            </InputAdornment>
          ),
        },
        inputLabel: { shrink: true },
      }}
    />
  );
});

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
