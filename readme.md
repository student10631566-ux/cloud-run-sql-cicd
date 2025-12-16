# Cloud Run SQL CI/CD Project

A Node.js Express application with MySQL database integration, designed for deployment on Google Cloud Platform (App Engine/Cloud Run) with Cloud SQL.

## Features

- Express.js web server
- MySQL database connection (Cloud SQL compatible)
- Client information management system
- CI/CD pipeline with Cloud Build
- Support for both Unix socket and TCP/IP database connections

## Prerequisites

- Node.js 20.x or higher
- npm (Node Package Manager)
- MySQL database (local or Cloud SQL)
- Google Cloud SDK (for deployment)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/student10631566-ux/cloud-run-sql-cicd.git
cd cloud-run-sql-cicd
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Local MySQL Database

1. Install MySQL on your local machine
2. Create the database and table:

```bash
mysql -u root -p < setup-database.sql
```

3. (Optional) Load sample data:

```bash
mysql -u root -p clientdb < sample-data-ireland.sql
```

4. Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

5. Update `.env` with your local database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=clientdb
DB_SSL=false
PORT=3000
```

#### Option B: Cloud SQL Proxy (for connecting to Cloud SQL locally)

1. Install [Cloud SQL Proxy](https://cloud.google.com/sql/docs/mysql/sql-proxy)

2. Run the proxy:

```bash
cloud-sql-proxy PROJECT_ID:REGION:INSTANCE_ID
```

3. Create a `.env` file:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=dbuser
DB_PASSWORD=your_password
DB_NAME=clientdb
DB_SSL=false
PORT=3000
```

### 4. Run the Application

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## Project Structure

```
cloud-run-sql-cicd/
├── server.js              # Express server and routes
├── db.js                  # Database connection module
├── package.json           # Node.js dependencies
├── app.yaml               # App Engine configuration
├── cloudbuild.yaml        # Cloud Build CI/CD configuration
├── schema.sql             # Database schema
├── setup-database.sql     # Database setup script
├── sample-data-ireland.sql # Sample data for testing
└── README.md              # This file
```

## Database Schema

The application uses a single `clients` table:

```sql
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    company VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DB_HOST` | Database hostname or socket path | Yes | `localhost` |
| `DB_PORT` | Database port | No | `3306` |
| `DB_USER` | Database username | Yes | - |
| `DB_PASSWORD` | Database password | Yes | - |
| `DB_NAME` | Database name | Yes | - |
| `DB_SSL` | Enable SSL (`true`/`false`) | No | `false` |
| `PORT` | Server port | No | `3000` |

### Cloud SQL Connection

For App Engine Standard Environment:
- Use Unix socket: `DB_HOST=/cloudsql/PROJECT_ID:REGION:INSTANCE_ID`
- No port or SSL needed

For Cloud Run or App Engine Flexible:
- Can use Unix socket or TCP/IP
- TCP/IP: Use private IP and set `DB_SSL=true`

## Deployment

### Deploy to App Engine

1. Make sure you're authenticated with Google Cloud:

```bash
gcloud auth login
gcloud config set project PROJECT_ID
```

2. Deploy using `app.yaml`:

```bash
gcloud app deploy app.yaml
```

### CI/CD with Cloud Build

The project includes a `cloudbuild.yaml` file for automated deployments:

1. Connect your GitHub repository to Cloud Build
2. Push changes to trigger the build
3. The pipeline will:
   - Install dependencies
   - Deploy to App Engine

## API Endpoints

- `GET /` - Returns HTML page with total client count from database

## Troubleshooting

### Database Connection Issues

1. **Check environment variables**: Ensure all required DB_* variables are set
2. **Verify database is running**: For local MySQL, ensure the service is running
3. **Check credentials**: Verify username and password are correct
4. **Cloud SQL Proxy**: If using Cloud SQL, ensure the proxy is running and connected

### Port Already in Use

If port 3000 is already in use, set a different port in your `.env` file:

```env
PORT=3001
```

## License

ISC

## Author

Student Project - CA-1
