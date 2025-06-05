
export const localDbConfig = {
  user: "cx_user",
  host: "10.169.39.64",
  database: "cx_dashboard_db",
  password: "@lquid#pass321",
  port: 5432,
};

export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-api.com' 
  : 'http://localhost:3001';
