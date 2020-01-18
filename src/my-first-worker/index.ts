import { expose } from "comlink";
import {
  takeALongTimeToDoSomething,
  takeALongTimeToAddTwoNumbers
} from "../takeALongTimeToDoSomething";

const exports = {
  takeALongTimeToDoSomething,
  takeALongTimeToAddTwoNumbers
};
export type MyFirstWorker = typeof exports;

expose(exports);
