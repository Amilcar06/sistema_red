import app from './app';
import { logger } from './utils/logger';
import './jobs/notification.job'; // Inicializar workers de colas

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

