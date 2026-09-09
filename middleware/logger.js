const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Custom request logger
exports.requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log after response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${logEntry.method} ${logEntry.url} - ${logEntry.status} - ${logEntry.duration}`);
    }
    
    // Write to log file
    const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFile(logFile, JSON.stringify(logEntry) + '\n', (err) => {
      if (err) console.error('Error writing to log file:', err);
    });
  });
  
  next();
};
