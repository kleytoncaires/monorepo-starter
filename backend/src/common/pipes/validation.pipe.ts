import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

const defaultOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
};

export function createValidationPipe(options?: ValidationPipeOptions): ValidationPipe {
  return new ValidationPipe({
    ...defaultOptions,
    ...options,
  });
}

export const GlobalValidationPipe = new ValidationPipe(defaultOptions);
