import React, { useState } from "react";
import "./App.css";
import { useTakeALongTimeToAddTwoNumbers } from "./App.hooks";

const App: React.FC = () => {
  const [number1, setNumber1] = useState(1);
  const [number2, setNumber2] = useState(2);

  const total = useTakeALongTimeToAddTwoNumbers(number1, number2);

  return (
    <div className="App">
      <h1>Web Workers in action!</h1>

      <div>
        <label>Number to add: </label>
        <input
          type="number"
          onChange={e => setNumber1(parseInt(e.target.value))}
          value={number1}
        />
      </div>
      <div>
        <label>Number to add: </label>
        <input
          type="number"
          onChange={e => setNumber2(parseInt(e.target.value))}
          value={number2}
        />
      </div>
      <h2>
        Total:{" "}
        {total.isCalculating ? (
          <em>Calculating...</em>
        ) : (
          <strong>{total.total}</strong>
        )}
      </h2>
    </div>
  );
};

export default App;
