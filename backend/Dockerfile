# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file
COPY ["ProjectManagerAPI.csproj", "./"]

# Restore dependencies
RUN dotnet restore "ProjectManagerAPI.csproj"

# Copy source code
COPY . .

# Build release
RUN dotnet build "ProjectManagerAPI.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "ProjectManagerAPI.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port
EXPOSE 8080

# Run application
ENTRYPOINT ["dotnet", "ProjectManagerAPI.dll"]
