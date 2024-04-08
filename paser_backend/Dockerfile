# Start with a Python base image that includes Node.js for the frontend build
FROM nikolaik/python-nodejs:python3.11-nodejs21

# Set the working directory inside the container
WORKDIR /paser-backend

# Copy the content of your paser-backend directory into the container
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

RUN python -c "from langchain_community.embeddings import HuggingFaceEmbeddings; HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')"

# Navigate to the frontend directory, install npm dependencies, and build the React app
WORKDIR /paser-backend/paser-frontend
RUN npm install && npm run build

# Change back to the paser-backend directory to run Django commands
WORKDIR /paser-backend

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Command to start the Django application
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]

