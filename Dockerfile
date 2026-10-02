# ==============================================================================
# Dockerfile para Distribuidora Fragama (FastAPI + SQLite + Frontend Completo)
# Soporte oficial para Render.com y contenedores Cloud
# ==============================================================================
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema mínimas
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código fuente, base de datos SQLite y assets del frontend
COPY . .

# Variables de entorno por defecto
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

EXPOSE 8080

# Iniciar servidor FastAPI en el puerto asignado dinámicamente por Render ($PORT)
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8080}"]
