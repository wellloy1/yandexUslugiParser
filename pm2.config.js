module.exports = {
	apps: [
		{
			name: 'yandexUslugiParser',
			script: './main.js',
			watch: true,
			ignore_watch: ['node_modules', 'cache', 'logs'],
			max_memory_restart: '120M',
			restart_delay: 3000,
			max_restarts: 3,
			exp_backoff_restart_delay: 3000,
		},
	],
}
