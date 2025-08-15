# Quick Setup Guide

This guide will help you get the Tactical Annotation App running on your local machine in under 10 minutes.

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd tactical-annotation-app
```

### 2. Backend Setup (5 minutes)

```bash
cd Backend

# Install dependencies
npm install

# Create environment file
echo "DATABASE_URL=mongodb://localhost:27017/tactical-annotation
JWT_SECRET=your-super-secret-jwt-key
PORT=3000" > .env

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start the server
npm run start:dev
```

### 3. Frontend Setup (3 minutes)

```bash
cd ../Frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### 4. Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn**

## 🔧 MongoDB Setup

### Option 1: Local MongoDB
```bash
# Install MongoDB locally
# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Option 2: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `DATABASE_URL` in `.env`

## 👤 Create Test User

```bash
cd Backend

# Create a user with custom credentials
npx ts-node create-user.ts <username> <password>

# Example: Create admin user
npx ts-node create-user.ts admin admin123

# Example: Create coach user
npx ts-node create-user.ts coach football2024
```

**Script Features:**
- ✅ **Password Hashing**: Automatically hashes passwords with bcrypt
- ✅ **Validation**: Ensures username and password are provided
- ✅ **Database Integration**: Creates users directly in the database
- ✅ **Error Handling**: Clear error messages for common issues

**Example Output:**
```bash
# Success
User created: { id: '...', username: 'admin', password: 'hashed_password' }

# Error - missing parameters
Usage: ts-node create-user.ts <username> <password>
```

**Prerequisites:**
- Database must be running
- Prisma client generated (`npx prisma generate`)
- Environment variables set in `.env`
- Dependencies installed (`npm install`)

Default test credentials (after running the script):
- Username: `admin`
- Password: `admin123`

## 🧪 Test the Application

1. **Login**: Use the credentials above
2. **Upload a video**: Try the video upload feature
3. **Create annotation**: Fill out the annotation form
4. **Test bulk upload**: Use the sample JSON file in the root directory

## 📁 Sample Files

- `sample-annotations.json` - Test JSON file for bulk upload
- `uploads/` - Directory for uploaded videos (auto-created)

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 4200
npx kill-port 4200
```

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh

# Or restart MongoDB service
sudo systemctl restart mongod
```

### Prisma Issues
```bash
# Reset Prisma
npx prisma generate
npx prisma db push --force-reset
```

## 📞 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review the troubleshooting section
- Create an issue in the repository

## 🎯 Next Steps

After setup, explore:
- [API Documentation](README.md#api-documentation)
- [Database Schema](README.md#database-schema)
- [Development Guide](README.md#development) 