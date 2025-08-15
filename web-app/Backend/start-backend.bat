@echo off
echo Starting Tactical Annotation Backend...
echo.

REM Check if .env file exists
if not exist .env (
    echo Creating .env file...
    echo DATABASE_URL="mongodb://localhost:27017/tactical-annotation" > .env
    echo JWT_SECRET="your-super-secret-jwt-key-change-this-in-production" >> .env
    echo PORT=3000 >> .env
    echo .env file created!
    echo.
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo Dependencies installed!
    echo.
)

REM Generate Prisma client
echo Generating Prisma client...
npx prisma generate
echo Prisma client generated!
echo.

REM Start the backend server
echo Starting backend server on port 3000...
echo Backend will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
npm run start:dev
