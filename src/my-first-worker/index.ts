import { expose } from 'comlink';
import { takeALongTimeToDoSomething } from '../takeALongTimeToDoSomething';

const exports = {
    takeALongTimeToDoSomething
};
export type MyFirstWorker = typeof exports;

expose(exports);