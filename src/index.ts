import express from 'express';
import path from 'path';
import sequelize, { connectWithRetry } from './models';
import measurement from './routes/measurement';

const app = express();
const port = process.env.PORT || 80;

app.use('/resources', express.static(path.join(__dirname, '../resources')));
app.use(express.json());
app.use('/api/measurements', measurement);

// Espera a conexão com o banco de dados antes de iniciar o servidor
connectWithRetry().then(() => {
  sequelize.sync().then(() => {
    console.log('Banco de dados sincronizado');
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  }).catch((err) => {
    console.error('Não foi possível sincronizar o banco de dados:', err);
  });
}).catch((err) => {
  console.error('Erro ao conectar ao banco de dados:', err);
});
