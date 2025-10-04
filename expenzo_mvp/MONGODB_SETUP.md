# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended for Demo)

1. **Create MongoDB Atlas Account**:
   - Go to https://www.mongodb.com/atlas
   - Sign up for a free account
   - Create a new cluster (free tier available)

2. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

3. **Update Environment Variables**:
   - Copy `env.example` to `.env`
   - Replace `MONGODB_URI` with your Atlas connection string
   - Example: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expenzo_mvp`

4. **Test Connection**:
   ```bash
   cd server
   npm run seed
   ```

## Option 2: Local MongoDB Installation

### Windows:
1. **Download MongoDB Community Server**:
   - Go to https://www.mongodb.com/try/download/community
   - Download Windows installer
   - Run installer with default settings

2. **Start MongoDB Service**:
   ```cmd
   net start MongoDB
   ```

3. **Verify Installation**:
   ```cmd
   mongod --version
   ```

### Alternative: Use Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Quick Test

Once MongoDB is running, test the connection:

```bash
# From project root
cd server
npm run seed
```

You should see:
```
Connected to MongoDB
Cleared existing data
Created company
Created admin user
Created manager user
Created employee user
Created sample expenses

=== SEED DATA CREATED ===
Admin: admin@demo.com / password123
Manager: manager@demo.com / password123
Employee: employee@demo.com / password123
========================
```

## Troubleshooting

**Connection Refused Error**:
- MongoDB service not running
- Wrong connection string
- Firewall blocking port 27017

**Authentication Error**:
- Wrong username/password in connection string
- User doesn't have database access permissions

**Network Error**:
- Check internet connection (for Atlas)
- Verify cluster is running (for Atlas)

