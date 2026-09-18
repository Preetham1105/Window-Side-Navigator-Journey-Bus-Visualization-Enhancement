import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Window-Side Navigator Backend' });
});

app.listen(PORT, () => {
  console.log(`☀ Window-Side Navigator Backend listening on port ${PORT}`);
});

export default app;
