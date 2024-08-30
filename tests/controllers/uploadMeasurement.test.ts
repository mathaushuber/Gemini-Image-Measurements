import request from 'supertest';
import express, { Express } from 'express';
import router from '../../src/routes/measurement';

// Mock das dependências
jest.mock('../../src/services/measurementService', () => ({
    checkDuplicateMeasurement: jest.fn().mockResolvedValue(false),
    saveMeasurement: jest.fn().mockResolvedValue({
        measure_value: 100,
        measure_uuid: 'mock-uuid',
    }),
}));

jest.mock('../../src/utils/imageUtils', () => ({
    saveBase64Image: jest.fn().mockReturnValue('mock-image.png'),
}));

jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn().mockResolvedValue({
                response: {
                    text: jest.fn().mockReturnValue('100'),
                },
            }),
        }),
    })),
}));

const app: Express = express();
app.use(express.json());
app.use('/api/measurements', router);

describe('Measurement Controller', () => {
    it('deve carregar uma medição com sucesso', async () => {
        const response = await request(app)
            .post('/api/measurements/upload')
            .send({
                image: 'data:image/png;base64,...',
                customer_code: '12345',
                measure_datetime: '2024-08-29T12:00:00Z',
                measure_type: 'WATER',
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            image_url: expect.stringMatching(/\/resources\/images\/.+\.(png|jpg|jpeg|webp)$/),
            measure_value: 100,
            measure_uuid: expect.any(String), // Aceita qualquer string como UUID
        });
    });

    it('deve retornar erro para campos ausentes', async () => {
        const response = await request(app).post('/api/measurements/upload').send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error_code: 'INVALID_DATA',
            error_description: 'Todos os campos são obrigatórios',
        });
    });

    it('deve retornar erro para "measure_type" diferente de GAS ou WATER', async () => {
        const response = await request(app).post('/api/measurements/upload').send({
            image: 'data:image/jpeg;base64,...',
            customer_code: '123',
            measure_datetime: '2024-08-30T14:00:00Z',
            measure_type: 'INVALID_TYPE',
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error_code: 'INVALID_DATA',
            error_description: 'Tipo de medição não permitida',
        });
    });

    it('deve retornar erro de conflito se for uma medição duplicada', async () => {
        const mockCheckDuplicateMeasurement = require('../../src/services/measurementService').checkDuplicateMeasurement;
        mockCheckDuplicateMeasurement.mockResolvedValueOnce(true);

        const response = await request(app)
            .post('/api/measurements/upload')
            .send({
                image: 'data:image/png;base64,abc123',
                customer_code: '12345',
                measure_datetime: '2023-08-29T00:00:00.000Z',
                measure_type: 'WATER',
            });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            error_code: 'DOUBLE_REPORT',
            error_description: 'Leitura do mês já realizada',
        });
    });

});
