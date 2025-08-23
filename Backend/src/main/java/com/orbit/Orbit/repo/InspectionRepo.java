package com.orbit.Orbit.repo;
import com.orbit.Orbit.model.Inspection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionRepo extends JpaRepository<Inspection,String> {
    // Optional: find an inspection by inspection number
    Optional<TransformerInspection> findByInspectionNo(String inspectionNo);

    // Find all inspections for a transformer number
    List<TransformerInspection> findByTransformer_TransformerNo(String transformerNo);
}
