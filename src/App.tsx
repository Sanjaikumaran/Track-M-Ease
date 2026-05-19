import { Route, Routes } from "react-router-dom";
import AddTransaction from "./pages/AddTransaction";

function App() {
  return (
    <Routes>
      <Route path="/add-transaction" element={<AddTransaction />} />;
    </Routes>
  );
}

export default App;
