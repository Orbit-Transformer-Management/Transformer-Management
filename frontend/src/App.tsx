import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/common/MainLayout';
import DashboardPage from './pages/DashboardPage';
import TransformersListPage from './pages/TransformersListPage';
import InspectionsPage from './pages/InspectionsPage';
import InspectionUploadPage from './pages/InspectionUploadPage'; //renamed hare
import TransformerHistoryPage from './pages/TransformerHistoryPage';
import MaintenanceRecordPage from './pages/MaintenanceRecordPage';

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
          <Route path="/inspections/:inspectionNo/upload" element={<InspectionUploadPage />} />
          {/* Maintenance Record Form */}
          <Route path="/transformers/:transformerNumber/maintenance" element={<MaintenanceRecordPage />} />
          <Route path="/settings" element={<div>Settings Page</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;