package com.orbit.Orbit.repo;

import com.orbit.Orbit.model.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenceRecordRepo extends JpaRepository<MaintenanceRecord, Long> {
    List<MaintenanceRecord> findByTransformer_TransformerNumber(String transformerNumber);
}
