import 'dotenv/config';
import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Initialize Database connection
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[INFO] TaskFlow AI Server started in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Graceful Shutdown Logic
  const gracefulShutdown = (signal: string) => {
    console.log(`[INFO] Received ${signal}. Starting graceful shutdown...`);
    server.close(() => {
      console.log(`[INFO] HTTP server closed.`);
      process.exit(0);
    });

    // Force close after 10s
    setTimeout(() => {
      console.error('[CRITICAL] Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  // Process signal handler shutdowns
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (err: Error) => {
    console.error(`[CRITICAL] Unhandled Promise Rejection: ${err.message}`);
    gracefulShutdown('unhandledRejection');
  });

  process.on('uncaughtException', (err: Error) => {
    console.error(`[CRITICAL] Uncaught System Exception: ${err.message}`);
    gracefulShutdown('uncaughtException');
  });
};

startServer();
