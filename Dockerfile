# Stage 1: Build Frontend
FROM node:20-alpine as frontend-build
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# Stage 2: Build Backend & Final Image
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
WORKDIR /app

# Install dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy frontend build from Stage 1
COPY --from=frontend-build /app/web/dist ./web/dist

WORKDIR /app/backend

# Create static/media dirs
RUN mkdir -p /app/backend/staticfiles /app/backend/media

# Expose port and run
EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate --noinput && python -c \"import django; django.setup(); from courses.bootstrap import ensure_learning_seed_data; ensure_learning_seed_data()\" && python manage.py collectstatic --noinput && gunicorn --bind 0.0.0.0:${PORT:-8000} kediscs.wsgi:application"]
