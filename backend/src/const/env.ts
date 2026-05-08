const { PORT: ENV_PORT, DATABASE_URL = '', API_KEY = 'wa_monday_public_2026' } = process.env

export default {
  PORT: Number(ENV_PORT) ?? 3000,
  DATABASE_URL,
  API_KEY
}
