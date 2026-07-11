module.exports = {
  apps: [
    {
      name: 'si-desa-api',
      script: './src/index.js',
      cwd: '/var/www/si-desa/server',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      // Restart on crash
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,
      // Logging
      error_file: '/var/www/si-desa/server/logs/error.log',
      out_file: '/var/www/si-desa/server/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Memory limit
      max_memory_restart: '256M',
    },
  ],
};
