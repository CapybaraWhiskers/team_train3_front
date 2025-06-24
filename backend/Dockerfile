# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and frontend for serving static files
COPY backend /app/backend
COPY frontend /app/frontend

# Run the application
CMD ["python", "backend/app.py"]
