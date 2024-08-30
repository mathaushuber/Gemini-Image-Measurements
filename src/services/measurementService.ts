import  Measurement  from '../models/Measurement';

export const checkDuplicateMeasurement = async (
  customer_code: string,
  measure_type: string,
  measure_year: number,
  measure_month: number
): Promise<boolean> => {
  const existingMeasurement = await Measurement.findOne({
    where: {
      customer_code,
      measure_type,
      measure_year,
      measure_month,
    },
  });

  return !!existingMeasurement;
};

export const saveMeasurement = async (
  data: {
    measure_uuid: string;
    customer_code: string;
    measure_type: string;
    measure_value: number;
    measure_datetime: Date;
    image_url: string;
  }
) => {
  return await Measurement.create(data);
};
