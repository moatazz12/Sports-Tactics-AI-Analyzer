# Backend Scripts Documentation

This directory contains utility scripts for managing the Tactical Annotation App.

## 📝 Available Scripts

### create-user.ts

A standalone script to create users in the database with proper password hashing.

#### Usage

```bash
# Basic usage
npx ts-node create-user.ts <username> <password>

# Examples
npx ts-node create-user.ts admin admin123
npx ts-node create-user.ts coach football2024
npx ts-node create-user.ts analyst tactical2024
```

#### Parameters

- **username** (required): The username for the new user
- **password** (required): The password for the new user

#### Features

- **🔐 Password Hashing**: Uses bcrypt with salt rounds of 10
- **✅ Validation**: Ensures both username and password are provided
- **🗄️ Database Integration**: Uses Prisma to create users
- **🛡️ Error Handling**: Proper error messages and database cleanup
- **🔒 Security**: Passwords are never stored in plain text

#### Output Examples

**Success:**
```bash
User created: {
  id: '507f1f77bcf86cd799439011',
  username: 'admin',
  password: '$2b$10$...'
}
```

**Error - Missing Parameters:**
```bash
Usage: ts-node create-user.ts <username> <password>
```

**Error - User Already Exists:**
```bash
Error: Unique constraint failed on the fields: (`username`)
```

#### Prerequisites

Before running the script, ensure:

1. **Database Connection**: MongoDB must be running and accessible
2. **Environment Variables**: `.env` file must be configured
3. **Prisma Client**: Run `npx prisma generate` first
4. **Dependencies**: Run `npm install` to install required packages

#### Environment Variables Required

```env
DATABASE_URL="mongodb://localhost:27017/tactical-annotation"
```

#### Security Considerations

- **Strong Passwords**: Use complex passwords in production
- **Unique Usernames**: Usernames must be unique in the database
- **Environment Security**: Keep `.env` file secure and never commit it
- **Access Control**: Limit script access to authorized administrators

#### Troubleshooting

**Script Fails to Run:**
```bash
# Check if ts-node is installed
npm install -g ts-node

# Check if dependencies are installed
npm install

# Check database connection
npx prisma studio
```

**Database Connection Error:**
```bash
# Verify MongoDB is running
mongosh

# Check DATABASE_URL in .env
cat .env

# Test Prisma connection
npx prisma db push
```

**User Creation Fails:**
```bash
# Check if user already exists
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma db push --force-reset
```

#### Integration with Application

The created users can immediately be used to:

1. **Login** to the application
2. **Access** all features (video upload, annotations, bulk upload)
3. **Manage** their own data
4. **Use** JWT authentication

#### Example Workflow

```bash
# 1. Set up the environment
cd Backend
npm install
npx prisma generate

# 2. Create environment file
echo "DATABASE_URL=mongodb://localhost:27017/tactical-annotation" > .env

# 3. Create users
npx ts-node create-user.ts admin admin123
npx ts-node create-user.ts coach coach2024
npx ts-node create-user.ts analyst tactical2024

# 4. Start the application
npm run start:dev

# 5. Login with created credentials
# Frontend: http://localhost:4200
```

#### Script Source Code

The script is located at `create-user.ts` and includes:

- Prisma client initialization
- bcrypt password hashing
- Command-line argument parsing
- Error handling and validation
- Database connection management

For modifications or customizations, refer to the source code in `create-user.ts`. 