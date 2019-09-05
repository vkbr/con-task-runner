# con-task-runner

Simple library to enable you run task concurrently.

## Installation

`npm install con-task-runner` or `yarn add con-task-runner`

## Usage

```js
import Concurrency from 'con-task-runner';
```

(Using common js)

```js
const { default: Concurrency } = require('con-task-runner');
```

Continue
```ts
import Concurrency from 'con-task-runner';

const tasks = [...];

const concurrency = 5;
const limit = tasks.length;

const taskRunner = Concurrency({ concurrency, limit } /* Options */);

taskRunner(async (taskIndex) => {
	await tasks[taskIndex]();
})
	.then(() => {
		console.log('All task completed successfully.');
	})
	.catch(() => {
		console.log('Some tasks couldn\'t be completed after max retries limit.');
	});
```

Options interface
```ts
interface Options {
	concurrency: number,
	limit: number,
	maxErrorRetries?: number,
	ignoreError?: boolean,
}
```
