## Requisitos

- Docker
- Docker Compose

Antes de rodar a aplicação, é necessário criar um arquivo `.env` na raiz do projeto e definir a chave da API do Gemini. O arquivo `.env` deve conter a seguinte linha:

```bash
GEMINI_API_KEY=suachaveaqui
```

## Como Rodar a Aplicação

Para iniciar a aplicação, utilize o Docker Compose. Os testes unitários são executados automaticamente antes da aplicação ser iniciada. Se algum teste falhar, a aplicação não será iniciada.

```bash
docker-compose up --build
```

## Rodando Testes

### Dentro do Container

Se desejar rodar apenas os testes dentro do container, utilize o seguinte comando:

```bash
MODE=test docker-compose up
```

### Fora do Container

Caso prefira rodar os testes localmente fora do container, primeiro instale as dependências (Node.js v18.15.0):

```bash
npm install
```

Em seguida, execute os testes:

```bash
npm run test
```

## Documentação da API

A aplicação possui três rotas principais que podem ser testadas utilizando a collection do Postman disponível em /docs/collections:

| Método | Rota                       | Descrição                                                                                   |
|--------|----------------------------|---------------------------------------------------------------------------------------------|
| POST   | `/upload`                  | Realiza o upload de uma nova medição. Recebe uma imagem em base64, código do consumidor, data da medição e tipo de medição (ÁGUA ou GÁS). |
| PATCH  | `/confirm`                 | Confirma ou corrige o valor lido pelo modelo de linguagem. Recebe o UUID da medição e o valor confirmado. |
| GET    | `/:customer_code/list`     | Lista as medições realizadas por um determinado cliente. Pode filtrar por tipo de medição (`WATER` ou `GAS`). |