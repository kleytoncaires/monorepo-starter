export const masks = {
  phone: [
    { mask: '(00) 0000-0000', lazy: true },
    { mask: '(00) 00000-0000', lazy: true },
  ],
  cpf: '000.000.000-00',
  cnpj: '00.000.000/0000-00',
  cep: '00000-000',
};

export const removeNonNumeric = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const applyPhoneMask = (value: string): string => {
  const numbers = removeNonNumeric(value);
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return value;
};
