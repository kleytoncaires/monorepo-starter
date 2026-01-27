export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
  UPLOAD_DIR: 'uploads',
  AVATAR_DIR: 'avatars',
};

export const UPLOAD_ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'Arquivo muito grande. Máximo permitido: 5MB',
  INVALID_FILE_TYPE: 'Tipo de arquivo não permitido',
  UPLOAD_FAILED: 'Falha ao fazer upload do arquivo',
  FILE_NOT_FOUND: 'Arquivo não encontrado',
};
