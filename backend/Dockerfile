FROM public.ecr.aws/lambda/python:3.13

# Install system dependencies for psycopg2 and other C-extensions
RUN microdnf install -y gcc postgresql-devel

# Copy requirements.txt
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install Python dependencies
# We use --no-cache-dir to keep the image small
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app directory
COPY app/ ${LAMBDA_TASK_ROOT}/app/

# Set the CMD to your handler
CMD [ "app.main.handler" ]
