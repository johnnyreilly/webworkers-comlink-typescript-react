import { wrap, releaseProxy, Remote } from "comlink";
import { useEffect, useState, useRef } from "react";

/**
 * Our hook that performs the calculation on the worker
 */
export function useTakeALongTimeToAddTwoNumbers(
  number1: number,
  number2: number
) {
  // We'll want to expose a wrapping object so we know when a calculation is in progress
  const [data, setData] = useState({
    isCalculating: false,
    total: undefined as number | undefined
  });

  // acquire our worker; it's wrapped in a ref so we don't recreate web workers as the inputs change
  const workerApiRef = useWorker()

  useEffect(() => {
    // We're starting the calculation here
    setData({ isCalculating: true, total: undefined });

    const { workerApi } = workerApiRef.current;
    workerApi
      .takeALongTimeToAddTwoNumbers(number1, number2)
      .then(total => setData({ isCalculating: false, total })); // We receive the result here

  }, [workerApiRef, setData, number1, number2]);

  return data;
}

function useWorker() {
  const workerAndCleanup = useRef(
    getWorker()
  );

  useEffect(() => {
    const { cleanup } = workerAndCleanup.current;

    // cleanup when we're done with our worker
    return () => {
      cleanup()
    };
  }, [workerAndCleanup]);

  return workerAndCleanup;
}

// We don't want to create a worker each time we trigger our hook
// so once we've created it for the first time we'll store it in this variable
let workerApiAndCleanup:
  | {
      workerApi: Remote<import("./my-first-worker").MyFirstWorker>;
      cleanup: () => void;
    }
  | undefined;

/**
 * Either returns the already created worker in workerApiAndCleanup
 * or creates the worker, a cleanup function and returns it
 */
function getWorker() {
  if (workerApiAndCleanup) {
    return workerApiAndCleanup;
  }

  // Here we create our worker and wrap it with comlink so we can interact with it
  const worker = new Worker("./my-first-worker", {
    name: "my-first-worker",
    type: "module"
  });
  const workerApi = wrap<import("./my-first-worker").MyFirstWorker>(worker);

  // A cleanup function that releases the comlink proxy, terminates the worker
  // and empties the workerApiAndCleanup variable
  const cleanup = () => {
    workerApi[releaseProxy]();
    worker.terminate();
    workerApiAndCleanup = undefined;
  };

  workerApiAndCleanup = { workerApi, cleanup };

  return workerApiAndCleanup;
}
