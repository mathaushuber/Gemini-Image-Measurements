import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

class HttpError extends Error {
  statusCode: number;
  errorCode: string;

  constructor(message: string, statusCode: number, errorCode: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

export const saveBase64Image = (base64Image: string, dirPath: string): string => {
  const mimeType = getMimeType(base64Image);
  const extension = getExtensionFromMimeType(mimeType);
  const fileName = `${uuidv4()}.${extension}`;
  const filePath = path.join(dirPath, fileName);

  const base64Data = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
  fs.writeFileSync(filePath, base64Data, 'base64');

  return fileName;
};

const getMimeType = (base64Image: string): string => {
  const match = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  if (!match) {
    // Lançar erro com 'error_code'
    throw new HttpError('Formato de imagem inválido', 400, 'INVALID_DATA');
  }
  return match[1];
};

const getExtensionFromMimeType = (mimeType: string): string => {
  const mimeTypeToExtension: Record<string, string> = {
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  const extension = mimeTypeToExtension[mimeType];
  if (!extension) {
    // Lançar erro com 'error_code'
    throw new HttpError('Tipo de imagem não suportada', 415, 'UNSUPPORTED_MEDIA_TYPE');
  }
  return extension;
};
