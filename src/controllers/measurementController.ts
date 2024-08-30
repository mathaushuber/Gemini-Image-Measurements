import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import Measurement from '../models/Measurement';
import { v4 as uuidv4 } from 'uuid';
import { checkDuplicateMeasurement, saveMeasurement } from '../services/measurementService';
import { saveBase64Image } from '../utils/imageUtils';
import { getMeasurementFromGemini } from '../services/geminiService';


export const uploadMeasurement = async (req: Request, res: Response) => {
  try {
    const { image, customer_code, measure_datetime, measure_type } = req.body;

    if (!image || !customer_code || !measure_datetime || !measure_type) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Todos os campos são obrigatórios',
      });
    }

    if (measure_type !== 'WATER' && measure_type !== 'GAS') {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Tipo de medição não permitida',
      });
    }

    const measureDate = new Date(measure_datetime);
    const measureYear = measureDate.getFullYear();
    const measureMonth = measureDate.getMonth() + 1;

    const isDuplicate = await checkDuplicateMeasurement(customer_code, measure_type, measureYear, measureMonth);
    if (isDuplicate) {
      return res.status(409).json({
        error_code: 'DOUBLE_REPORT',
        error_description: 'Leitura do mês já realizada',
      });
    }

    const imageDir = path.join(__dirname, '../../', 'resources', 'images');
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }
    const fileName = saveBase64Image(image, imageDir);
    const imageUrl = `${req.protocol}://${req.get('host')}/resources/images/${fileName}`;

    const newMeasureValue = await getMeasurementFromGemini(image, fileName);

    const measureUuid = uuidv4();

    const newMeasurement = await saveMeasurement({
      measure_uuid: measureUuid,
      customer_code,
      measure_type,
      measure_value: newMeasureValue,
      measure_datetime: measureDate,
      image_url: imageUrl,
    });

    return res.status(200).json({
      image_url: imageUrl,
      measure_value: newMeasurement.measure_value,
      measure_uuid: measureUuid,
    });
  } catch (error: any) {
    console.error('Error:', error);
  
    let errorCode = 'SERVER_ERROR';
    if (error.message.includes('API')) {
      errorCode = 'API_ERROR';
    } else if (error.errorCode) {
      errorCode = error.errorCode;
    }
  
    return res.status(error.statusCode || 500).json({
      error_code: errorCode,
      error_description: error.message || 'Erro interno do servidor',
    });
  }
};



export const confirmMeasurement = async (req: Request, res: Response) => {
  try {
    const { measure_uuid, confirmed_value } = req.body;

    // Validação dos tipos de dados
    if (typeof measure_uuid !== 'string' || typeof confirmed_value !== 'number') {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Dados fornecidos são inválidos',
      });
    }

    // Verificar se o código de leitura informado existe
    const measurement = await Measurement.findOne({ where: { measure_uuid } });

    if (!measurement) {
      return res.status(404).json({
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'Leitura não encontrada',
      });
    }

    // Verificar se o código de leitura já foi confirmado
    if (measurement.has_confirmed) {
      return res.status(409).json({
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'Leitura já confirmada',
      });
    }

    // Salvar o novo valor informado
    measurement.measure_value = confirmed_value;
    measurement.has_confirmed = true;
    await measurement.save();

    // Resposta de sucesso
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error_code: 'SERVER_ERROR',
      error_description: 'Erro interno do servidor',
    });
  }
};

export const listMeasurements = async (req: Request, res: Response) => {
  try {
    const { customer_code } = req.params;
    const { measure_type } = req.query;

    // Validação do código do cliente
    if (!customer_code) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Código do cliente é obrigatório',
      });
    }

    const whereClause: any = { customer_code };

    // Validação e tratamento do parâmetro measure_type
    if (measure_type) {
      const normalizedMeasureType = (measure_type as string).toUpperCase();

      if (normalizedMeasureType !== 'WATER' && normalizedMeasureType !== 'GAS') {
        return res.status(400).json({
          error_code: 'INVALID_TYPE',
          error_description: 'Tipo de medição não permitida',
        });
      }

      whereClause.measure_type = normalizedMeasureType;
    }

    // Busca das medições no banco de dados
    const measurements = await Measurement.findAll({ where: whereClause });

    // Verificação se algum registro foi encontrado
    if (measurements.length === 0) {
      return res.status(404).json({
        error_code: 'MEASURES_NOT_FOUND',
        error_description: 'Nenhuma leitura encontrada',
      });
    }

    // Formatação da resposta
    const formattedMeasures = measurements.map(measurement => ({
      measure_uuid: measurement.measure_uuid,
      measure_datetime: measurement.measure_datetime,
      measure_type: measurement.measure_type,
      has_confirmed: measurement.has_confirmed,
      image_url: measurement.image_url,
    }));

    return res.status(200).json({
      customer_code,
      measures: formattedMeasures,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error_code: 'SERVER_ERROR',
      error_description: 'Erro interno do servidor',
    });
  }
};
