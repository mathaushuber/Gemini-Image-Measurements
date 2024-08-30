import request from 'supertest';
import express, { Express } from 'express';
import { listMeasurements } from '../../src/controllers/measurementController';
import Measurement from '../../src/models/Measurement';

// Mock das dependências
jest.mock('../../src/models/Measurement', () => ({
    findAll: jest.fn(),
}));

const app: Express = express();
app.use(express.json());
app.get('/api/measurements/:customer_code/list', listMeasurements);

describe('Measurement List Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar erro 404 se nenhuma leitura for encontrada', async () => {
        const mockFindAll = Measurement.findAll as jest.MockedFunction<typeof Measurement.findAll>;
        mockFindAll.mockResolvedValueOnce([]);

        const response = await request(app).get('/api/measurements/12345/list');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error_code: 'MEASURES_NOT_FOUND',
            error_description: 'Nenhuma leitura encontrada',
        });
    });

    it('deve listar as medidas realizadas por um cliente com sucesso', async () => {
        const mockFindAll = Measurement.findAll as jest.MockedFunction<typeof Measurement.findAll>;
        mockFindAll.mockResolvedValueOnce([
            {
                measure_uuid: 'mock-uuid-1',
                measure_datetime: '2024-08-29T12:00:00Z',
                measure_type: 'WATER',
                has_confirmed: true,
                image_url: 'http://example.com/image1.png',
            },
            {
                measure_uuid: 'mock-uuid-2',
                measure_datetime: '2024-08-30T14:00:00Z',
                measure_type: 'GAS',
                has_confirmed: false,
                image_url: 'http://example.com/image2.png',
            },
        ] as any);

        const response = await request(app).get('/api/measurements/12345/list');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            customer_code: '12345',
            measures: [
                {
                    measure_uuid: 'mock-uuid-1',
                    measure_datetime: '2024-08-29T12:00:00Z',
                    measure_type: 'WATER',
                    has_confirmed: true,
                    image_url: 'http://example.com/image1.png',
                },
                {
                    measure_uuid: 'mock-uuid-2',
                    measure_datetime: '2024-08-30T14:00:00Z',
                    measure_type: 'GAS',
                    has_confirmed: false,
                    image_url: 'http://example.com/image2.png',
                },
            ],
        });
    });

    it('deve filtrar as medidas por tipo quando measure_type for fornecido', async () => {
        const mockFindAll = Measurement.findAll as jest.MockedFunction<typeof Measurement.findAll>;
        mockFindAll.mockResolvedValueOnce([
            {
                measure_uuid: 'mock-uuid-1',
                measure_datetime: '2024-08-29T12:00:00Z',
                measure_type: 'WATER',
                has_confirmed: true,
                image_url: 'http://example.com/image1.png',
            },
        ] as any);

        const response = await request(app).get('/api/measurements/12345/list?measure_type=WATER');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            customer_code: '12345',
            measures: [
                {
                    measure_uuid: 'mock-uuid-1',
                    measure_datetime: '2024-08-29T12:00:00Z',
                    measure_type: 'WATER',
                    has_confirmed: true,
                    image_url: 'http://example.com/image1.png',
                },
            ],
        });

        // Verifica se o findAll foi chamado com o whereClause correto
        expect(mockFindAll.mock.calls[0][0]).toEqual({
            where: { customer_code: '12345', measure_type: 'WATER' },
        });
    });

    it('deve retornar erro 500 em caso de erro no servidor', async () => {
        const mockFindAll = Measurement.findAll as jest.MockedFunction<typeof Measurement.findAll>;
        mockFindAll.mockRejectedValueOnce(new Error('Erro interno do servidor'));

        const response = await request(app).get('/api/measurements/12345/list');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            error_code: 'SERVER_ERROR',
            error_description: 'Erro interno do servidor',
        });
    });
});
