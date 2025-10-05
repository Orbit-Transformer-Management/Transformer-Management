package com.orbit.Orbit.repo;

import com.orbit.Orbit.model.InspectionComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InspectionCommentRepo extends JpaRepository<InspectionComment, Long> {
    List<InspectionComment> findByInspection_InspectionNumberOrderByCreatedAtDesc(String inspectionNumber);
}
