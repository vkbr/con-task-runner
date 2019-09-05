const { default: Concurrency } = require('../dist');

const taskRunner = Concurrency({ limit: 100, concurrency: 4 });

const wait = () => new Promise(resolve => setTimeout(resolve, Math.random() * 10));

taskRunner(async (taskNumber) => {
	await wait();
	console.log(`Task number ${taskNumber}`);
}).then(() => console.log('All done!'));
