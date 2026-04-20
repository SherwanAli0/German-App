import cors from 'cors'

const ALLOWED_ORIGIN = 'http://localhost:5173'

export const corsGuard = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl health checks from same machine)
    // but reject any browser origin that isn't the Vite dev server
    if (!origin || origin === ALLOWED_ORIGIN) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
})
