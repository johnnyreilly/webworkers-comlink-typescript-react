# Web Workers, comlink, TypeScript and React

JavaScript is famously single threaded.  However, if you're developing for the web, you may well know that this is not quite accurate.  There are [`Web Workers`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers):

> A worker is an object created using a constructor (e.g. `Worker()`) that runs a named JavaScript file — this file contains the code that will run in the worker thread; workers run in another global context that is different from the current window. 

Given that there is a way to use other threads for background processing, why doesn't this happen all the time? Well there's a number of reasons; not the least of which is the ceremony involved in interacting with Web Workers. Consider the following example that illustrates moving a calculation into a worker:

```js
// main.js
function add2NumbersUsingWebWorker() {
    const myWorker = new Worker("worker.js");

    myWorker.postMessage([42, 7]);
    console.log('Message posted to worker');

    myWorker.onmessage = function(e) {
        console.log('Message received from worker', e.data);
    }
}

add2NumbersUsingWebWorker();

// worker.js
onmessage = function(e) {
  console.log('Worker: Message received from main script');
  const result = e.data[0] * e.data[1];
  if (isNaN(result)) {
    postMessage('Please write two numbers');
  } else {
    const workerResult = 'Result: ' + result;
    console.log('Worker: Posting message back to main script');
    postMessage(workerResult);
  }
}
```

*This is not simple.*  It's hard to understand what's happening. Also, this approach only supports a single method call.  I'd much rather write something that looked more like this:

```js
// main.js
function add2NumbersUsingWebWorker() {
    const myWorker = new Worker("worker.js");

    const total = myWorker.add2Numbers([42, 7]);
    console.log('Message received from worker', total);
}

add2NumbersUsingWebWorker();

// worker.js
export function add2Numbers(firstNumber, secondNumber) {
  const result = firstNumber + secondNumber;
  return (isNaN(result))
    ? 'Please write two numbers'
    : 'Result: ' + result;
}
```

There's a way to do this using a library made by Google called [comlink](https://github.com/GoogleChromeLabs/comlink). This post will demonstrate how we can use this.  We'll use TypeScript and webpack.  We'll also examine how to integrate this approach into a React app.

#### A use case for a Web Worker

Let's make ourselves a TypeScript web app. We're going to use `create-react-app` for this:

```shell
npx create-react-app webworkers-comlink-typescript-react --template typescript
```

Create a `takeALongTimeToDoSomething.ts` file alongside `index.tsx`:

```ts
export function takeALongTimeToDoSomething() {
    console.log('Start our long running job...');
    const seconds = 5;
    const start = new Date().getTime();
    const delay = seconds * 1000;

    while (true) {
        if ((new Date().getTime() - start) > delay) {
            break;
        }
    }
    console.log('Finished our long running job');
}
```

To `index.tsx` add this code:

```ts
import { takeALongTimeToDoSomething } from './takeALongTimeToDoSomething';

// ...

console.log('Do something');
takeALongTimeToDoSomething();
console.log('Do another thing');
```

When our application runs we see this behaviour:

![a demo of blocking](blocking.gif)

The app starts and logs `Do something` and `Start our long running job...` to the console. It then blocks the UI until the `takeALongTimeToDoSomething` function has completed running.  During this time the screen is empty and unresponsive. This is a poor user experience.



