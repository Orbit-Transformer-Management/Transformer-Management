package com.orbit.Orbit.service;

import com.orbit.Orbit.dto.RoboflowResponse;
import com.orbit.Orbit.dto.UpdateDetectionRequest;
import com.orbit.Orbit.model.Inspection;
import com.orbit.Orbit.model.InspectionDetectsTimeline;
import com.orbit.Orbit.model.InspectionModelDetects;
import com.orbit.Orbit.repo.InspectionDetectsTimelineRepo;
import com.orbit.Orbit.repo.InspectionModelDetectsRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DetectsService {
    private final InspectionModelDetectsRepo inspectionModelDetectsRepository;
    private final InspectionDetectsTimelineRepo inspectionDetectsTimelineRepository;

    public DetectsService(InspectionModelDetectsRepo inspectionModelDetectsRepository, InspectionDetectsTimelineRepo inspectionDetectsTimelineRepository) {
        this.inspectionModelDetectsRepository = inspectionModelDetectsRepository;
        this.inspectionDetectsTimelineRepository = inspectionDetectsTimelineRepository;
    }

    public void save(RoboflowResponse predictions, Inspection inspection){
        for (var out : predictions.getOutputs()) {
            if (out.getPredictions() == null || out.getPredictions().getPredictions() == null) continue;
            for (var d : out.getPredictions().getPredictions()) {
                InspectionModelDetects e = new InspectionModelDetects();
                e.setInspection(inspection);         // your current Inspection entity
                e.setWidth(d.getWidth());
                e.setHeight(d.getHeight());
                e.setX(d.getX());
                e.setY(d.getY());
                e.setConfidence(d.getConfidence());
                e.setClassId(d.getClassId());
                e.setDetectionId(d.getDetectionId());
                e.setClassName(d.getClassName());
                e.setParentId(d.getParentId());
                inspectionModelDetectsRepository.save(e);
            }
        }
    }

    public List<InspectionModelDetects> get(String inspectionNumber){
        return inspectionModelDetectsRepository.findByInspection_InspectionNumber(inspectionNumber);
    }

    public InspectionModelDetects update(UpdateDetectionRequest req,String detectId){
        InspectionModelDetects existing = inspectionModelDetectsRepository
                .findById(detectId)
                .orElseThrow(() -> new RuntimeException("Detection not found with id: " + detectId));
        existing.setWidth(req.getWidth());
        existing.setHeight(req.getHeight());
        existing.setX(req.getX());
        existing.setY(req.getY());
        existing.setConfidence(req.getConfidence());
        existing.setClassId(req.getClassId());

        //ADD that to the timeline
        InspectionDetectsTimeline timeline = new InspectionDetectsTimeline(existing,req.getAuthor(), req.getComment());
        inspectionDetectsTimelineRepository.save(timeline);
        return inspectionModelDetectsRepository.save(existing);
    }

    public List<InspectionDetectsTimeline> timelineget(String inspectionNumber){
        return inspectionDetectsTimelineRepository.findByInspection_InspectionNumberOrderByCreatedAtDesc(inspectionNumber);
    }




}
