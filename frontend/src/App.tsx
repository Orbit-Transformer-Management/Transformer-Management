import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/common/MainLayout';
import DashboardPage from './pages/DashboardPage';
import TransformersListPage from './pages/TransformersListPage';
import InspectionsPage from './pages/InspectionsPage';
import TransformerDetailPage from './pages/TransformerDetailPage';
import TransformerHistoryPage from './pages/TransformerHistoryPage';

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
          {/* Transformer History/Details Page */}
          <Route path="/transformers/:id/history" element={<TransformerHistoryPage />} />
          {/* Transformer Upload Images Page */}
          <Route path="/transformers/:id/upload" element={<TransformerDetailPage />} />
          <Route path="/settings" element={<div>Settings Page</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;