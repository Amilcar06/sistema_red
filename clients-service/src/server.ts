import app from './app';
import { logger } from './utils/logger';
import { connectMongoDB } from './config/mongo';

// Conectar a MongoDB
connectMongoDB();

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

