#!/bin/bash
cd "$(dirname "$0")"
export JAVA_HOME=/home/esteban-gv/Descargas/jdk-21_linux-x64_bin/jdk-21.0.12
echo "Compilando proyecto..."
./mvnw clean package -DskipTests

# Si Maven falla, detiene la ejecución inmediatamente
if [ $? -ne 0 ]; then
    echo "¡La compilación falló! Corrija los errores antes de continuar."
    exit 1
fi


echo "Levantando Docker..."
docker compose up --build -d