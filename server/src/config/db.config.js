import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'nanova_jwt_secret_token_key_2026_super_secure',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminSetupKey: process.env.ADMIN_SETUP_KEY || 'nanova_setup_admin_key_2026',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  db: {
    client: process.env.DB_CLIENT || 'auto',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nanova_db',
    sqlitePath: path.resolve(__dirname, '../../', process.env.SQLITE_PATH || './data/nanova.sqlite')
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    notificationEmail: process.env.NOTIFICATION_EMAIL || ''
  }
};
