package com.orbit.Orbit.repo;

import com.orbit.Orbit.model.InspectionDetectsTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InspectionDetectsTimelineRepo extends JpaRepository<InspectionDetectsTimeline, Long> {

    // Newest -> oldest for a whole inspection
    List<InspectionDetectsTimeline> findByInspection_InspectionNumberOrderByCreatedAtDesc(String inspectionNumber);

    // Newest -> oldest for a specific detect
    List<InspectionDetectsTimeline> findByDetect_DetectIdOrderByCreatedAtDesc(Long detectId);
    
    // Delete all timeline entries for an inspection
    @Modifying
    @Query("DELETE FROM InspectionDetectsTimeline t WHERE t.inspection.inspectionNumber = :inspectionNumber")
    void deleteByInspectionNumber(@Param("inspectionNumber") String inspectionNumber);
}