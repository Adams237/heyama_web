module.exports = {
  apps: [{
    name: 'frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/frontend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 9009,
    },
    watch: false,
    max_memory_restart: '1G',
  }]
}