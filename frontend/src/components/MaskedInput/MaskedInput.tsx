import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField'
import { forwardRef, useCallback, useEffect, useRef } from 'react'
import { IMask } from 'react-imask'

type IMaskInput = ReturnType<typeof IMask>
type MaskedDynamic = IMaskInput & {
  compiledMasks: Array<{ mask: string }>
  value: string
}

interface MaskedInputProps extends Omit<TextFieldProps, 'inputComponent'> {
  mask: string | Array<{ mask: string; lazy?: boolean }>
  maskChar?: string
  onAccept?: (value: string, maskRef: IMaskInput) => void
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, maskChar = '_', onAccept, onChange, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const maskRef = useRef<IMaskInput | null>(null)
    const onChangeRef = useRef(onChange)
    const onAcceptRef = useRef(onAccept)

    onChangeRef.current = onChange
    onAcceptRef.current = onAccept

    const handleAccept = useCallback(() => {
      if (maskRef.current) {
        const maskedValue = maskRef.current.value
        if (onAcceptRef.current) {
          onAcceptRef.current(maskedValue, maskRef.current)
        }
        if (onChangeRef.current) {
          const event = {
            target: {
              value: maskedValue,
              name: props.name || '',
            },
          } as React.ChangeEvent<HTMLInputElement>
          onChangeRef.current(event)
        }
      }
    }, [props.name])

    useEffect(() => {
      if (inputRef.current) {
        const isArrayMask = Array.isArray(mask)

        const maskOptions = isArrayMask
          ? {
              mask,
              dispatch: (appended: string, dynamicMasked: MaskedDynamic) => {
                const number = (dynamicMasked.value + appended).replace(/\D/g, '')
                return number.length > 10
                  ? dynamicMasked.compiledMasks[1]
                  : dynamicMasked.compiledMasks[0]
              },
            }
          : {
              mask,
              placeholderChar: maskChar,
              lazy: true,
            }

        maskRef.current = IMask(
          inputRef.current,
          maskOptions as Parameters<typeof IMask>[1],
        )

        maskRef.current.on('accept', handleAccept)

        return () => {
          if (maskRef.current) {
            maskRef.current.destroy()
          }
        }
      }
    }, [mask, maskChar, handleAccept])

    useEffect(() => {
      if (maskRef.current && props.value !== undefined) {
        maskRef.current.value = props.value != null ? String(props.value) : ''
      }
    }, [props.value])

    return (
      <TextField
        {...props}
        inputRef={(element) => {
          inputRef.current = element
          if (ref) {
            if (typeof ref === 'function') {
              ref(element)
            } else {
              ref.current = element
            }
          }
        }}
        onChange={() => {}}
      />
    )
  },
)

MaskedInput.displayName = 'MaskedInput'

export default MaskedInput
