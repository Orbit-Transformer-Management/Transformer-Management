package com.orbit.Orbit.repo;
import com.orbit.Orbit.model.Inspection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionRepo extends JpaRepository<Inspection,String> {
    List<Inspection> findByTransformer_TransformerNumber(String transformerNumber);

}
