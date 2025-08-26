import { useState } from "react";
import { SketchPicker } from "react-color";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <SketchPicker />
      <div></div>
    </>
  );
}

export default App;
