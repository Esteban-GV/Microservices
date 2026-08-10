#!/bin/bash
cd "$(dirname "$0")"
echo "Compilando proyecto..."
./mvnw clean package -DskipTests

# Si Maven falla, detiene la ejecución inmediatamente
if [ $? -ne 0 ]; then
    echo "¡La compilación falló! Corrija los errores antes de continuar."
    exit 1
fi


echo "Levantando Docker..."
docker compose up --build -d