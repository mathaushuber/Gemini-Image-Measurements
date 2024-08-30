import Measurement from '../../src/models/Measurement';

describe('Measurement Model', () => {
  it('should create a Measurement instance', () => {
    const measurement = Measurement.build({
      measure_uuid: 'mock-uuid',
      customer_code: '12345',
      measure_type: 'WATER',
      measure_value: 100,
      measure_datetime: new Date(),
      image_url: 'https://cdn.pixabay.com/photo/2023/09/02/03/15/water-8228076_640.jpg',
      has_confirmed: false,
    });

    expect(measurement.measure_uuid).toBe('mock-uuid');
    expect(measurement.customer_code).toBe('12345');
    expect(measurement.measure_type).toBe('WATER');
    expect(measurement.measure_value).toBe(100);
    expect(measurement.image_url).toBe('https://cdn.pixabay.com/photo/2023/09/02/03/15/water-8228076_640.jpg');
    expect(measurement.has_confirmed).toBe(false);
  });
});
