FROM python:3.12-slim

WORKDIR /app

COPY apps/onprem-sensitive-api/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/onprem-sensitive-api/app ./app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9000"]
