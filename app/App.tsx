import { Routes, Route } from 'react-router-dom';
import AssignmentGradingPage from './routes/AssignmentGradingPage';

function App() {
  return (
    <Routes>
      <Route path="/assignments/:assignmentId/grade" element={<AssignmentGradingPage />} />
    </Routes>
  );
}

export default App; 