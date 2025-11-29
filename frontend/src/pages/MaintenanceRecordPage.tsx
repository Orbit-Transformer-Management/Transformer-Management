import React from 'react';
import PageLayout from '../components/common/PageLayout';
import MaintenanceRecordForm from '../components/MaintenanceRecordForm';

const MaintenanceRecordPage: React.FC = () => {
  return (
    <PageLayout title="Maintenance Record">
      <MaintenanceRecordForm />
    </PageLayout>
  );
};

export default MaintenanceRecordPage;
