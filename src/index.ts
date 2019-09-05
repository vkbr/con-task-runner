interface Options {
	concurrency: number,
	limit: number,
	maxErrorRetries?: number,
	ignoreError?: boolean,
}

interface Completer {
	resolve(): void,
	reject(error?: Error): void,
}

interface ErroredTask {
	i: number,
	errorRetryCount: number,
}

type Task= (currentIteration: number) => Promise<any>;

type Runner = (task: Task) => Promise<any>;

const Concurrency = ({ limit, concurrency, maxErrorRetries=2, ignoreError=false }: Options): Runner => {
	const errors: ErroredTask[] = [];
	const errorsMaxRetried: ErroredTask[] = [];
	let completer: Completer;
	let stagedTask;
	let taskCounter = 0;
	let runner;

	const exec = async (i: number, errorRetryCount: number = 0) => {
		try {
			await runner(i);
		} catch (e) {
			if (!ignoreError) {
				(errorRetryCount < maxErrorRetries ? errors : errorsMaxRetried).push({ i, errorRetryCount: errorRetryCount + 1 });
			}
		}
	};

	const stage = async () => {
		if (stagedTask === 0 && errors.length === 0) {
			if (errorsMaxRetried.length > 0) {
				completer.reject();
			} else {
				completer.resolve();
			}
			return;
		}

		if (taskCounter === limit && errors.length === 0) {
			return;
		}

		let taskNumber;
		let errorCounter = -1;

		if (taskCounter < limit) {
			taskNumber = taskCounter++;
		} else {
			const errorTask = errors.pop();
			taskNumber = errorTask.i;
			errorCounter = errorTask.errorRetryCount;
		}

		stagedTask = (stagedTask || 0) + 1;
		await exec(taskNumber, errorCounter);
		--stagedTask;

		stage();
	};

	return async (task: Task) => {
		runner = task;
		return new Promise((resolve, reject) => {
			completer = { resolve, reject };

			for (let i=0; i<limit && i<concurrency; i++) {
				stage();
			}
		});
	};
};

export default Concurrency;
