package com.transformer.manage_transformers.transformer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface transformerInspectionRepo extends JpaRepository<TransformerInspection,String> {

    // Delete all inspections for a transformer number
    void deleteByTransformer_TransformerNo(String transformerNo);

    // Delete a single inspection by its inspection number
    void deleteByInspectionNo(String inspectionNo);

    // Optional: find an inspection by inspection number
    Optional<TransformerInspection> findByInspectionNo(String inspectionNo);

    // Find all inspections for a transformer number
    List<TransformerInspection> findByTransformer_TransformerNo(String transformerNo);

}



