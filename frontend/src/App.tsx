import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/common/MainLayout';
import DashboardPage from './pages/DashboardPage';
import TransformersListPage from './pages/TransformersListPage';
import InspectionsPage from './pages/InspectionsPage';
import TransformerDetailPage from './pages/TransformerDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Redirect root to the transformers page */}
          <Route path="/" element={<Navigate to="/transformers" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transformers" element={<TransformersListPage />} />
          <Route path="/inspections" element={<InspectionsPage />} />
          <Route path="/transformers/:id" element={<TransformerDetailPage />} />
          <Route path="/settings" element={<div>Settings Page</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;