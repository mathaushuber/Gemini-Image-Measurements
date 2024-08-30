import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/env';

class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const getMeasurementFromGemini = async (image: string, fileName: string): Promise<number> => {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
    });

    const filePart: Part = {
      inlineData: {
        data: image.replace(/^data:image\/[a-zA-Z+]+;base64,/, ''),
        mimeType: 'image/' + fileName.split('.').pop(),
      },
    };

    const result = await model.generateContent([
      filePart,
      {
        text: "Give me a measure of water or gas based on the image I'm sending you. Just answer me an entire amount, without any text. If the image is not water or gas, just return the value 0.",
      },
    ]);

    const newMeasureValue = parseInt(result.response.text(), 10);

    if (isNaN(newMeasureValue)) {
      throw new HttpError('Failed to parse measurement value as an integer', 500);
    }

    return newMeasureValue;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new HttpError('Erro ao consultar a API externa', 500);
  }
};
