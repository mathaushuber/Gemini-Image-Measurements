import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: Number(process.env.DB_PORT),
    logging: false,
  }
);

export const connectWithRetry = async (): Promise<Sequelize> => {
  const maxRetries = 10;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await sequelize.authenticate();
      console.log('A conexão foi estabelecida com sucesso.');
      return sequelize;
    } catch (error) {
      retries += 1;
      console.error(`Não é possível conectar-se ao banco de dados (tentativa ${retries} de ${maxRetries}):`, error);
      await new Promise(res => setTimeout(res, 10000));
    }
  }

  throw new Error('Não foi possível conectar-se ao banco de dados após diversas tentativas.');
};

export default sequelize;
