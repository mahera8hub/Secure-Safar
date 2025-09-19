# SecureSafar - Deployment & Integration Guide

## 🚀 Quick Start

### Option 1: Windows Startup Script
```bash
# Simply run the startup script
start.bat
```

### Option 2: Manual Setup
```bash
# Backend setup
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
source venv/bin/activate  # On Linux/macOS
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend setup (in another terminal)
cd frontend
npm install
npm run dev
```

### Option 3: Docker Setup
```bash
# Complete stack with Docker
docker-compose up -d

# Or build and run specific services
docker-compose up postgres mongodb redis
docker-compose up backend frontend
```

## 🌐 Access Points

Once running, access the application at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API**: http://localhost:8000/redoc

## 👥 Demo Accounts

Use these pre-configured accounts to test the system:

### Tourist Account
- **Email**: `tourist@securesafar.com`
- **Password**: `tourist123`
- **Features**: Digital ID, location tracking, safety score, panic button

### Police Account
- **Email**: `police@securesafar.com`
- **Password**: `police123`
- **Features**: Tourist monitoring, alerts dashboard, ID verification

### Admin Account
- **Email**: `admin@securesafar.com`
- **Password**: `admin123`
- **Features**: System administration, user management

## 🧪 Testing the Application

### 1. Authentication Testing
```bash
# Test login endpoint
curl -X POST "http://localhost:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=tourist@securesafar.com&password=tourist123"
```

### 2. Tourist Features Testing
1. Login as tourist
2. Create/view tourist profile
3. Update location (simulated GPS)
4. Test panic button
5. View safety score
6. Check itinerary

### 3. Police Features Testing
1. Login as police officer
2. View tourist clusters on map
3. Monitor real-time alerts
4. Test ID verification
5. Review heatmaps
6. Check alert feed

### 4. Real-time Features
1. Open tourist dashboard in one tab
2. Open police dashboard in another tab
3. Trigger panic button from tourist dashboard
4. Verify alert appears in police dashboard
5. Test location updates and monitoring

## 🗄️ Database Setup

### PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE securesafar;

-- Create user (optional)
CREATE USER securesafar_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE securesafar TO securesafar_user;
```

### MongoDB Setup
```javascript
// Create database and collections
use securesafar;

// Create collections with indexes
db.location_history.createIndex({ "location": "2dsphere" });
db.location_history.createIndex({ "tourist_id": 1, "timestamp": -1 });
db.geofence_events.createIndex({ "tourist_id": 1, "created_at": -1 });
```

### Database Initialization
```bash
cd backend
python init_database.py
```

## 🔧 Configuration

### Environment Variables
Create `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/securesafar
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=securesafar

# Security
SECRET_KEY=your-super-secret-jwt-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External Services (Optional)
MAPBOX_ACCESS_TOKEN=your-mapbox-token
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend Configuration
Update `frontend/src/contexts/AuthContext.tsx` if needed:

```typescript
const API_BASE_URL = 'http://localhost:8000';
```

## 🐳 Docker Deployment

### Development Environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Environment
```bash
# Production build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# With SSL certificates
docker-compose --profile production up -d
```

## 🌍 Production Deployment

### 1. Server Setup
```bash
# Install dependencies
sudo apt update
sudo apt install -y python3 python3-pip nodejs npm postgresql mongodb redis-server nginx

# Clone repository
git clone https://github.com/your-org/securesafar.git
cd securesafar
```

### 2. Backend Production Setup
```bash
cd backend

# Create production virtual environment
python3 -m venv venv
source venv/bin/activate

# Install production dependencies
pip install -r requirements.txt
pip install gunicorn

# Set up production environment
cp .env.example .env
# Edit .env with production values

# Initialize database
python init_database.py

# Start with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 3. Frontend Production Setup
```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with nginx
sudo cp -r dist/* /var/www/html/
```

### 4. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Configuration

### SSL/TLS Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Setup
```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Database Security
```bash
# PostgreSQL security
sudo -u postgres psql
ALTER USER postgres PASSWORD 'strong_password';
\q

# Edit pg_hba.conf for production
sudo nano /etc/postgresql/13/main/pg_hba.conf
```

## 📊 Monitoring & Logging

### Application Monitoring
```bash
# Install monitoring tools
pip install prometheus-client
npm install @prometheus/client

# Set up log rotation
sudo nano /etc/logrotate.d/securesafar
```

### Health Checks
```bash
# Backend health check
curl http://localhost:8000/health

# Frontend health check
curl http://localhost:5173

# Database connectivity
python -c "from backend.database import engine; print('DB Connected' if engine else 'DB Error')"
```

## 🔄 Backup & Recovery

### Database Backup
```bash
# PostgreSQL backup
pg_dump securesafar > backup_$(date +%Y%m%d).sql

# MongoDB backup
mongodump --db securesafar --out backup_$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump securesafar > /backups/postgres_$DATE.sql
mongodump --db securesafar --out /backups/mongo_$DATE
find /backups -name "*.sql" -mtime +7 -delete
find /backups -name "mongo_*" -mtime +7 -exec rm -rf {} \;
```

### Restore Procedures
```bash
# PostgreSQL restore
psql securesafar < backup_20240101.sql

# MongoDB restore
mongorestore --db securesafar backup_20240101/securesafar
```

## 🚨 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.8+

# Check dependencies
pip install -r requirements.txt

# Check database connection
python -c "from database import engine; print(engine)"

# Check environment variables
python -c "from decouple import config; print(config('DATABASE_URL'))"
```

#### Frontend Won't Start
```bash
# Check Node.js version
node --version  # Should be 16+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
netstat -tulpn | grep :5173
```

#### Database Connection Issues
```bash
# PostgreSQL service
sudo systemctl status postgresql
sudo systemctl start postgresql

# MongoDB service
sudo systemctl status mongod
sudo systemctl start mongod

# Redis service
sudo systemctl status redis
sudo systemctl start redis
```

#### WebSocket Connection Issues
```bash
# Check Redis connection
redis-cli ping

# Check WebSocket endpoint
wscat -c ws://localhost:8000/ws/test

# Verify CORS settings
curl -H "Origin: http://localhost:5173" http://localhost:8000/
```

### Performance Issues

#### Slow API Responses
```bash
# Check database queries
# Add logging to see slow queries

# Monitor system resources
htop
iotop
```

#### High Memory Usage
```bash
# Monitor Python processes
ps aux | grep python

# Check for memory leaks
python -m memory_profiler backend/main.py
```

## 📋 Integration Checklist

### Pre-deployment
- [ ] All environment variables configured
- [ ] Database initialized with sample data
- [ ] SSL certificates installed (production)
- [ ] Firewall rules configured
- [ ] Backup procedures tested
- [ ] Monitoring tools installed

### Post-deployment Testing
- [ ] All demo accounts can login
- [ ] Tourist dashboard loads correctly
- [ ] Police dashboard shows data
- [ ] Location tracking works
- [ ] Panic button triggers alerts
- [ ] WebSocket connections established
- [ ] API endpoints respond correctly
- [ ] Database connections stable
- [ ] AI model predictions working
- [ ] Geofencing alerts functional

### Production Readiness
- [ ] Performance testing completed
- [ ] Security audit passed
- [ ] Load testing successful
- [ ] Backup/restore verified
- [ ] Monitoring alerts configured
- [ ] Documentation complete
- [ ] User training completed
- [ ] Support procedures established

## 🎯 Success Criteria

### Functional Requirements Met
✅ **Authentication System**: Role-based access with JWT tokens  
✅ **Tourist Dashboard**: Digital ID, safety score, location tracking, panic button  
✅ **Police Dashboard**: Real-time monitoring, alerts, tourist clusters, heatmaps  
✅ **Real-time Alerts**: WebSocket-based live notifications  
✅ **AI Anomaly Detection**: TensorFlow-powered behavior analysis  
✅ **Blockchain Integration**: Hyperledger Fabric digital IDs  
✅ **Geofencing**: Real-time zone monitoring and alerts  
✅ **Multilingual Support**: English, Spanish, French translations  
✅ **Responsive Design**: Material-UI components for all devices  
✅ **Security**: OAuth2 + JWT with comprehensive protection  

### Technical Requirements Met
✅ **React.js Frontend**: Modern TypeScript-based SPA  
✅ **FastAPI Backend**: High-performance Python API  
✅ **Database Integration**: PostgreSQL + MongoDB hybrid storage  
✅ **Real-time Communication**: WebSocket implementation  
✅ **Containerization**: Docker support for easy deployment  
✅ **Documentation**: Comprehensive guides and API docs  

---

**🎉 Congratulations! SecureSafar is now ready for deployment and use. For support, refer to the documentation or contact the development team.**