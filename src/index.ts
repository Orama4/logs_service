import express from 'express';
import { logHandler } from './logController';

const app = express();
app.use(express.json());

// Correct usage: specify method and path
app.post('/log', logHandler);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Central Log Service running on port ${PORT}`);
});
