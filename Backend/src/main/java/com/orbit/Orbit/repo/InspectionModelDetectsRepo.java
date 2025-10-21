package com.orbit.Orbit.repo;

import com.orbit.Orbit.model.InspectionModelDetects;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InspectionModelDetectsRepo extends JpaRepository<InspectionModelDetects, String> {
    List<InspectionModelDetects> findByInspection_InspectionNumber(String inspectionNumber);

    @Modifying
    @Query("DELETE FROM InspectionModelDetects d WHERE d.inspection.inspectionNumber = :inspectionNumber")
    void deleteByInspectionNumber(@Param("inspectionNumber") String inspectionNumber);
}
