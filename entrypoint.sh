#!/bin/bash
# Função para rodar os testes
run_tests() {
  echo "Modo de teste detectado. Rodando os testes..."
  exec npm run test
  TEST_RESULT=$?
  if [ $TEST_RESULT -eq 0 ]; then
    echo "Todos os testes foram aprovados."
    return 0
  else
    echo "Alguns testes falharam."
    return 1
  fi
}

# Função para aguardar a disponibilidade do banco de dados
wait_for_db() {
  echo "Aguardando o banco de dados estar pronto..."
  until nc -z "$DB_HOST" "$DB_PORT"; do
    echo "Aguardando banco de dados..."
    sleep 5
  done
}

wait_for_db

echo "Banco de dados está pronto."

if [ "$MODE" = "test" ]; then
  run_tests
  unset MODE
  TEST_EXIT_CODE=$? 
  exit $TEST_EXIT_CODE
elif [ "$MODE" = "dev" ]; then
  echo "Executando os testes..."
  if npm test; then
    echo "Todos os testes foram aprovados."
    exec npm run dev
  else
    echo "Alguns testes falharam. A aplicação não será iniciada."
    exit 1
  fi
fi
