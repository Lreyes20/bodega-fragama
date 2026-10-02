# ==============================================================================
# Multi-stage Dockerfile for Distribuidora Fragama Warehouse API
# ==============================================================================

# Etapa 1: Build y compilación
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copiar csproj y restaurar dependencias para aprovechar caché de capas Docker
COPY src/Fragama.Domain/*.csproj src/Fragama.Domain/
COPY src/Fragama.Application/*.csproj src/Fragama.Application/
COPY src/Fragama.Infrastructure/*.csproj src/Fragama.Infrastructure/
COPY src/Fragama.API/*.csproj src/Fragama.API/

RUN dotnet restore src/Fragama.API/Fragama.API.csproj

# Copiar todo el código fuente y publicar
COPY src/ ./src/
WORKDIR /app/src/Fragama.API
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Etapa 2: Runtime ligero y seguro
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Usuario no root para mejores prácticas de seguridad
USER app

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Fragama.API.dll"]
