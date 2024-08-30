import { Model, DataTypes } from 'sequelize';
import sequelize from './index';

class Measurement extends Model {
  public measure_uuid!: string;
  public customer_code!: string;
  public measure_type!: string;
  public measure_value!: number;
  public measure_datetime!: Date;
  public image_url!: string;
  public has_confirmed!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Measurement.init({
  measure_uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customer_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  measure_type: {
    type: DataTypes.ENUM('WATER', 'GAS'),
    allowNull: false,
  },
  measure_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  measure_datetime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  has_confirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'measurements',
  timestamps: true,
  underscored: true,
});

export default Measurement;