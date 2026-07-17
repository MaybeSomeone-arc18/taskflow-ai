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

  // Process signal handler shutdowns
  process.on('unhandledRejection', (err: Error) => {
    console.error(`[CRITICAL] Unhandled Promise Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err: Error) => {
    console.error(`[CRITICAL] Uncaught System Exception: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
