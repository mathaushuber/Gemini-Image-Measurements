import request from 'supertest';
import express, { Express } from 'express';
import { confirmMeasurement } from '../../src/controllers/measurementController';
import Measurement from '../../src/models/Measurement';

// Mock das dependências
jest.mock('../../src/models/Measurement', () => ({
    findOne: jest.fn(),
    save: jest.fn(),
}));

const app: Express = express();
app.use(express.json());
app.patch('/api/measurements/confirm', confirmMeasurement);

describe('Measurement Confirm Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar erro 400 se os dados fornecidos forem inválidos', async () => {
        const response = await request(app)
            .patch('/api/measurements/confirm')
            .send({
                measure_uuid: 123, // measure_uuid deveria ser string
                confirmed_value: 'invalid', // confirmed_value deveria ser number
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error_code: 'INVALID_DATA',
            error_description: 'Dados fornecidos são inválidos',
        });
    });

    it('deve retornar erro 404 se a leitura não for encontrada', async () => {
        const mockFindOne = Measurement.findOne as jest.MockedFunction<typeof Measurement.findOne>;
        mockFindOne.mockResolvedValueOnce(null); // Simula a leitura não encontrada

        const response = await request(app)
            .patch('/api/measurements/confirm')
            .send({
                measure_uuid: 'mock-uuid',
                confirmed_value: 150,
            });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error_code: 'MEASURE_NOT_FOUND',
            error_description: 'Leitura não encontrada',
        });
    });

    it('deve retornar erro 409 se a leitura já foi confirmada', async () => {
        const mockFindOne = Measurement.findOne as jest.MockedFunction<typeof Measurement.findOne>;
        mockFindOne.mockResolvedValueOnce({
            has_confirmed: true,
        } as any); // Simula leitura já confirmada

        const response = await request(app)
            .patch('/api/measurements/confirm')
            .send({
                measure_uuid: 'mock-uuid',
                confirmed_value: 150,
            });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            error_code: 'CONFIRMATION_DUPLICATE',
            error_description: 'Leitura já confirmada',
        });
    });

    it('deve confirmar a leitura com sucesso', async () => {
        const mockFindOne = Measurement.findOne as jest.MockedFunction<typeof Measurement.findOne>;
        const mockSave = jest.fn();

        mockFindOne.mockResolvedValueOnce({
            has_confirmed: false,
            measure_value: 100,
            save: mockSave,
        } as any); // Simula leitura encontrada e não confirmada

        const response = await request(app)
            .patch('/api/measurements/confirm')
            .send({
                measure_uuid: 'mock-uuid',
                confirmed_value: 150,
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
        });

        expect(mockSave).toHaveBeenCalled(); // Verifica se a função de salvar foi chamada
        expect(mockFindOne.mock.calls[0][0]).toEqual({ where: { measure_uuid: 'mock-uuid' } });
    });

    it('deve retornar erro 500 em caso de erro no servidor', async () => {
        const mockFindOne = Measurement.findOne as jest.MockedFunction<typeof Measurement.findOne>;
        mockFindOne.mockRejectedValueOnce(new Error('Erro interno do servidor'));

        const response = await request(app)
            .patch('/api/measurements/confirm')
            .send({
                measure_uuid: 'mock-uuid',
                confirmed_value: 150,
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            error_code: 'SERVER_ERROR',
            error_description: 'Erro interno do servidor',
        });
    });
});
