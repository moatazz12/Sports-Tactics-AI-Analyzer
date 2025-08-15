# Tactical Annotation App

A comprehensive web application for analyzing football tactical sequences through video annotation and bulk processing capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [File Structure](#file-structure)
- [Development](#development)
- [Deployment](#deployment)

## 🎯 Overview

The Tactical Annotation App is a full-stack application designed for football analysts and coaches to:
- Upload and annotate tactical video sequences
- Process multiple videos and annotations in bulk
- Store and manage tactical data with proper relationships
- Provide a user-friendly interface for tactical analysis

## ✨ Features

### Core Features
- **Video Upload**: Support for multiple video formats (MP4, AVI, MOV, WMV, FLV)
- **Individual Annotation**: Create detailed tactical annotations for single videos
- **Bulk Upload**: Process up to 5 videos and corresponding JSON annotations simultaneously
- **JSON Processing**: Split large JSON files into individual annotation files
- **File Management**: Download individual files or complete ZIP archives
- **Authentication**: JWT-based user authentication and authorization

### Advanced Features
- **Smart File Matching**: Automatic pairing of videos with corresponding JSON annotations
- **Validation**: Comprehensive file type and content validation
- **Error Handling**: Detailed error reporting and user feedback
- **Real-time Processing**: Live status updates during file operations
- **Responsive Design**: Mobile-friendly interface

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Angular)     │◄──►│   (NestJS)      │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend (Angular)
- **Single Page Application** with component-based architecture
- **Reactive Forms** for data input and validation
- **HTTP Client** for API communication
- **File Upload** with drag-and-drop support
- **Real-time Updates** with RxJS observables

### Backend (NestJS)
- **RESTful API** with proper HTTP status codes
- **JWT Authentication** with guards and strategies
- **File Processing** with Multer integration
- **Database Integration** with Prisma ORM
- **Validation** with class-validator decorators

## 🛠️ Technology Stack

### Frontend
- **Angular 17** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **JSZip** - ZIP file creation
- **CSS3** - Modern styling with animations

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **Multer** - File upload handling

### Database
- **MongoDB** - Document-based database
- **Prisma** - Database schema management

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run start:dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Start development server
npm start
```

## ⚙️ Configuration

### Environment Variables (Backend)

Create a `.env` file in the Backend directory:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/tactical-annotation"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Server
PORT=3000
```

### API Configuration

The backend runs on `http://localhost:3000` by default. The frontend is configured to connect to this URL.

## 👤 User Management

### Creating Users

The application includes a standalone script to create users. This script is located in the Backend directory.

#### Using the Create User Script

```bash
# Navigate to backend directory
cd Backend

# Create a user with custom credentials
npx ts-node create-user.ts <username> <password>

# Example: Create user 'admin' with password 'admin123'
npx ts-node create-user.ts admin admin123

# Example: Create user 'coach' with password 'football2024'
npx ts-node create-user.ts coach football2024
```

#### Script Features

- **Password Hashing**: Passwords are automatically hashed using bcrypt
- **Validation**: Script validates that both username and password are provided
- **Database Integration**: Uses Prisma to create users in the database
- **Error Handling**: Proper error messages and database disconnection

#### Script Output

```bash
# Successful user creation
User created: { id: '...', username: 'admin', password: 'hashed_password' }

# Error - missing parameters
Usage: ts-node create-user.ts <username> <password>

# Error - user already exists
Error: Unique constraint failed on the fields: (`username`)
```

#### Prerequisites

Before running the script, ensure:
1. **Database is running** and accessible
2. **Prisma client is generated**: `npx prisma generate`
3. **Environment variables** are set in `.env`
4. **Dependencies are installed**: `npm install`

#### Security Notes

- **Strong Passwords**: Use strong, unique passwords for production
- **Username Uniqueness**: Usernames must be unique in the database
- **Password Hashing**: All passwords are automatically hashed
- **Environment Security**: Keep your `.env` file secure and never commit it

## 📖 Usage

### 1. Authentication
- Navigate to the application
- Login with your credentials
- JWT token is automatically managed

### 2. Individual Video Annotation
1. **Upload Video**: Drag and drop or select a video file
2. **Fill Form**: Enter tactical information
   - Home team and away team
   - Coach name
   - Tactical annotation
   - Comments
3. **Submit**: Create the annotation

### 3. Bulk Upload Process
1. **Step 1 - JSON Processing**:
   - Upload a JSON file containing multiple annotations
   - System splits it into individual files
   - Download individual files or ZIP archive

2. **Step 2 - File Upload**:
   - Drag and drop up to 5 videos and JSON files
   - System automatically matches videos with annotations
   - Review file list and remove if needed

3. **Step 3 - Processing**:
   - Click "Lancer l'upload en lot"
   - Monitor progress and results
   - View success/error status for each file

### 4. File Management
- **Individual Downloads**: Click download button next to each file
- **ZIP Download**: Download all files as a single ZIP archive
- **File Limits**: Maximum 5 files per bulk upload

## 🔌 API Documentation

### Authentication Endpoints

#### POST /auth/login
```json
{
  "username": "string",
  "password": "string"
}
```

#### Response
```json
{
  "access_token": "jwt-token"
}
```

### Video Endpoints

#### GET /video/getAllVideos
Returns all uploaded videos.

#### POST /video/uploadVideo
Upload a single video file.

#### POST /video/bulkUpload
Upload multiple files (max 5) with annotations.

**Request**: Multipart form data
- `files`: Array of video and JSON files
- `annotations`: JSON string of annotations

#### GET /video/getVideoById/:id
Get video by ID.

#### PUT /video/updateVideo/:id
Update video information.

#### DELETE /video/deleteVideo/:id
Delete a video.

### Annotation Endpoints

#### GET /annotation/getAllAnnotation
Returns all annotations.

#### POST /annotation/createAnnotation
Create a new annotation.

```json
{
  "id_sequence": "string",
  "annotation": "string",
  "validateur": "string",
  "commentaire": "string",
  "domicile": "string?",
  "visiteuse": "string?",
  "videoId": "string"
}
```

#### GET /annotation/getAnnotationById/:id_sequence
Get annotation by ID sequence.

#### PATCH /annotation/updateAnnotation/:id_sequence
Update an annotation.

#### DELETE /annotation/deleteAnnotation/:id_sequence
Delete an annotation.

## 🗄️ Database Schema

### Video Model
```prisma
model Video {
  id         String      @id @default(auto()) @map("_id") @db.ObjectId
  path       String
  filename   String?
  annotations Annotation[]
}
```

### Annotation Model
```prisma
model Annotation {
  id               String           @id @default(auto()) @map("_id") @db.ObjectId
  id_sequence      String           @unique
  annotation       String
  validateur       String
  date_annotation  DateTime?        @default(now())
  commentaire      String
  domicile         String?
  visiteuse        String?
  videoId          String           @db.ObjectId
  video            Video            @relation(fields: [videoId], references: [id])
  rapportAnalyses  RapportAnalyse[]
}
```

### User Model
```prisma
model User {
  id       String  @id @default(auto()) @map("_id") @db.ObjectId
  username String  @unique
  password String
}
```

## 📁 File Structure

```
tactical-annotation-app/
├── Backend/
│   ├── src/
│   │   ├── annotation/          # Annotation module
│   │   ├── auth/               # Authentication module
│   │   ├── video/              # Video module
│   │   ├── rapport/            # Report module
│   │   ├── prisma/             # Database service
│   │   └── main.ts             # Application entry point
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── uploads/                # Video storage (gitignored)
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── home/           # Main page component
│   │   │   ├── login/          # Login component
│   │   │   ├── video-upload/   # Video upload component
│   │   │   ├── tactical-annotation-form/  # Annotation form
│   │   │   ├── bulk-upload/    # Bulk upload component
│   │   │   ├── services/       # API services
│   │   │   └── guards/         # Authentication guards
│   │   └── main.ts
│   └── package.json
└── README.md
```

## 🛠️ Development

### Backend Development

```bash
# Start development server with hot reload
npm run start:dev

# Run tests
npm run test

# Build for production
npm run build

# Start production server
npm run start:prod
```

### Frontend Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset
```

## 🚀 Deployment

### Backend Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set environment variables** for production

3. **Start the server**:
   ```bash
   npm run start:prod
   ```

### Frontend Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your web server

3. **Update API URL** in production environment

### Docker Deployment (Optional)

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./Backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mongodb://mongo:27017/tactical-annotation
    depends_on:
      - mongo

  frontend:
    build: ./Frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## 🔒 Security Considerations

- **JWT Tokens**: Secure token-based authentication
- **File Validation**: Strict file type and size validation
- **Input Sanitization**: All user inputs are validated
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Environment Variables**: Sensitive data stored in environment variables

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Check DATABASE_URL in .env file
   - Ensure MongoDB is running

2. **File Upload Fails**:
   - Check file size limits
   - Verify file type is supported
   - Ensure uploads directory exists

3. **Authentication Issues**:
   - Verify JWT_SECRET is set
   - Check token expiration

4. **CORS Errors**:
   - Verify CORS configuration in main.ts
   - Check frontend API URL

### Logs

- Backend logs are available in the console
- Frontend errors appear in browser console
- Database queries can be logged with Prisma

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.