import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const logDir = path.join(__dirname, '../../logs');
const logFile = path.join(logDir, 'microservices.log');

// Ensure the logs directory exists
(async () => {
  try {
    await fs.mkdir(logDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create log directory:', err);
  }
})();

interface LogBody {
  level: string;
  message: string;
  service: string;
  timestamp?: string;
  environment?: string;
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  ip?: string;
  statusCode?: number;
  response?: any;
  metadata?: Record<string, any>;
}

export const logHandler = async (req: Request<{}, {}, LogBody>, res: Response): Promise<void> => {
  const {
    level,
    message,
    service,
    timestamp,
    environment,
    userId,
    requestId,
    endpoint,
    method,
    ip,
    statusCode,
    response,
    metadata,
  } = req.body;

  if (!level || !message || !service) {
    res.status(400).json({ error: 'Missing required fields: level, message, or service' });
    return;
  }

  const logTimestamp = timestamp || new Date().toISOString();

  const logParts = [
    `[${logTimestamp}]`,
    `[${level.toUpperCase()}]`,
    `[${service}]`,
    environment && `[env: ${environment}]`,
    userId && `[user: ${userId}]`,
    requestId && `[requestId: ${requestId}]`,
    method && `[method: ${method}]`,
    endpoint && `[endpoint: ${endpoint}]`,
    ip && `[ip: ${ip}]`,
    statusCode !== undefined && `[status: ${statusCode}]`,
    message,
    metadata && `\nMetadata: ${JSON.stringify(metadata, null, 2)}`,
    response && `\nResponse: ${typeof response === 'object' ? JSON.stringify(response, null, 2) : String(response)}`
  ].filter(Boolean).join(' ');

  try {
    await fs.appendFile(logFile, logParts + '\n');
    res.status(200).send('Log received');
  } catch (err) {
    console.error('Failed to write log:', err);
    res.status(500).send('Log write failed');
  }
};
