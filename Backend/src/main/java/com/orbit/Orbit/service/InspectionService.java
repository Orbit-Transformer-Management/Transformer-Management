package com.orbit.Orbit.service;

import com.orbit.Orbit.dto.CommentResponse;
import com.orbit.Orbit.dto.InspectionRequest;
import com.orbit.Orbit.dto.InspectionResponse;
import com.orbit.Orbit.model.Inspection;
import com.orbit.Orbit.model.InspectionComment;
import com.orbit.Orbit.model.InspectionModelDetects;
import com.orbit.Orbit.model.Transformer;
import com.orbit.Orbit.repo.InspectionCommentRepo;
import com.orbit.Orbit.repo.InspectionModelDetectsRepo;
import com.orbit.Orbit.repo.InspectionRepo;
import com.orbit.Orbit.repo.TransformerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orbit.Orbit.dto.RoboflowResponse;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;


import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class InspectionService {

    //For Roboflow
    @Autowired
    private ObjectMapper objectMapper;

    private final InspectionRepo inspectionRepository;
    private final InspectionCommentRepo inspectionCommentRepository;
    private final InspectionModelDetectsRepo inspectionModelDetectsRepository;

    private final TransformerService transformerService;

    private final RoboflowService roboflowService;

    public InspectionService(InspectionRepo inspectionRepository, TransformerService transformerService, RoboflowService roboflowService,InspectionCommentRepo inspectionCommentRepository, InspectionModelDetectsRepo inspectionModelDetectsRepository) {
        this.inspectionRepository = inspectionRepository;
        this.transformerService = transformerService;
        this.roboflowService = roboflowService;
        this.inspectionCommentRepository = inspectionCommentRepository;
        this.inspectionModelDetectsRepository = inspectionModelDetectsRepository;
    }

    public Inspection save(InspectionRequest req){
        Inspection inspection = new Inspection();
        Transformer transformer = transformerService.get(req.getTransformerNumber());
        inspection.setInspectionNumber(req.getInspectionNumber());
        inspection.setTransformer(transformer); // FK via relation
        inspection.setInspectionDate(req.getInspectionDate());
        inspection.setInspectionTime(req.getInspectionTime());
        inspection.setBranch(req.getBranch());
        inspection.setMaintenanceDate(req.getMaintenanceDate());
        inspection.setMaintenanceTime(req.getMaintenanceTime());
        inspection.setStatus(req.getStatus());
        return inspectionRepository.save(inspection);
    }



    public List<InspectionResponse> get() {
        List<InspectionResponse> inspections = inspectionRepository
                .findAll()
                .stream()
                .map(InspectionResponse::new)
                .toList();
        return inspections;
    }

    public InspectionResponse get(String inspectionNumber) {
        return inspectionRepository.findById(inspectionNumber)
                .map(InspectionResponse::new) // entity -> DTO
                .orElse(null);
    }

    public InspectionResponse update(String inspectionNumber, InspectionRequest inspectionUpdate) {
        // 1. Find the existing inspection or throw an exception if it's not found.
        Inspection existingInspection = inspectionRepository.findById(inspectionNumber)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + inspectionNumber));

        // 2. Conditionally update fields only if new values are provided in the request.
        if (inspectionUpdate.getInspectionDate() != null) {
            existingInspection.setInspectionDate(inspectionUpdate.getInspectionDate());
        }
        if (inspectionUpdate.getInspectionTime() != null) {
            existingInspection.setInspectionTime(inspectionUpdate.getInspectionTime());
        }
        if (inspectionUpdate.getBranch() != null) {
            existingInspection.setBranch(inspectionUpdate.getBranch());
        }
        if (inspectionUpdate.getMaintenanceDate() != null) {
            existingInspection.setMaintenanceDate(inspectionUpdate.getMaintenanceDate());
        }
        if (inspectionUpdate.getMaintenanceTime() != null) {
            existingInspection.setMaintenanceTime(inspectionUpdate.getMaintenanceTime());
        }
        if (inspectionUpdate.getStatus() != null) {
            existingInspection.setStatus(inspectionUpdate.getStatus());
        }

        //Cant change the transformer related to inspection. Do we need it change it
        // 3. Save the updated inspection to the database and return it.
       Inspection updatedInspection = inspectionRepository.save(existingInspection);

        return new InspectionResponse(updatedInspection);
    }

    public List<InspectionModelDetects> getPredictions(String inspectionNumber) {
        return inspectionModelDetectsRepository.findByInspection_InspectionNumber(inspectionNumber);
    }

//    public RoboflowResponse updatePrediction(String inspectionNumber, RoboflowResponse prediction) {
//        Inspection inspection = inspectionRepository.findById(inspectionNumber)
//                .orElse(null);
//
//        if (inspection == null) {
//            return null; // or throw new RuntimeException("Inspection not found");
//        }
//
//        try {
//            // Convert DTO -> JSON string
//            String json = objectMapper.writeValueAsString(prediction);
//
//            // Save it in the inspection
//            inspection.setPredictionJson(json);
//            inspectionRepository.save(inspection);
//
//            return prediction; // return the same DTO back
//        } catch (Exception e) {
//            throw new RuntimeException("Error saving prediction JSON", e);
//        }
//    }





    public boolean delete(String inspectionNumber){
        if (!inspectionRepository.existsById(inspectionNumber)) return false;
        inspectionRepository.deleteById(inspectionNumber);
        return true;
    }

    public List<InspectionResponse> getInspectionOfTransformer(String transformerNumber) {
        return inspectionRepository.findByTransformer_TransformerNumber(transformerNumber)
                .stream()
                .map(InspectionResponse::new) // convert entity -> DTO
                .toList();
    }

    public String saveInspectionImage(String inspectionNumber, MultipartFile image) {
        try {
            // Base directory: uploads/Inspections/{InspectionNumber}
            Path dir = Path.of("uploads", "inspections", inspectionNumber);
            Files.createDirectories(dir);

            // Create a safe filename with UUID to avoid collisions
            String original = image.getOriginalFilename();
            String filename = (original == null || original.isBlank()) ? "image" : original;

            Path dest = dir.resolve(filename);
            image.transferTo(dest);
            // Return public URL mapping (e.g., /files/Inspections/{InspectionNumber}/{filename})
            String final_url = "/files/inspections/" + inspectionNumber + "/" + filename;

            Inspection inspection = inspectionRepository.findById(inspectionNumber)
                    .orElse(null);
            inspection.setInspection_image_url(final_url);

            //Doing Analysis
            String base64Image;
            try (InputStream inputStream = image.getInputStream()) {
                byte[] bytes = inputStream.readAllBytes();
                base64Image = Base64.getEncoder().encodeToString(bytes);
            } catch (IOException e) {
                throw new UncheckedIOException("Failed to read image resource", e);
            }
            RoboflowResponse predictions = roboflowService.analyzeInspectionImage(base64Image);
            this.inspectionRepository.save(inspection);
            //inspection.setPredictionJson(objectMapper.writeValueAsString(prediction));
            //Saving all the predictions

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

        return final_url;


        } catch (IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }

    public Resource getInspectionImage(String inspectionNumber){
        Inspection inspection = inspectionRepository.findById(inspectionNumber)
                .orElse(null);
        if (inspection.getInspectionDate()==null) return null;
        String url = inspection.getInspection_image_url(); // e.g. /files/Inspections/123/uuid.png
        Path path = Path.of("uploads", url.replace("/files/", ""));
        Resource resource = new org.springframework.core.io.PathResource(path);
        return resource;
    }

    //Comments
    public InspectionComment addComment(String inspectionNumber,String topic, String comment, String author) {
        Inspection inspection = inspectionRepository.findById(inspectionNumber)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

        InspectionComment newComment = new InspectionComment();
        newComment.setInspection(inspection);
        newComment.setTopic(topic);
        newComment.setComment(comment);
        newComment.setAuthor(author);

        return inspectionCommentRepository.save(newComment);
    }

    public List<CommentResponse> getComments(String inspectionNumber) {
        return inspectionCommentRepository
                .findByInspection_InspectionNumberOrderByCreatedAtDesc(inspectionNumber)
                .stream()
                .map(CommentResponse::new)
                .toList();
    }

    public InspectionComment updateComment(Long commentId, String topic, String comment, String author) {


        // Find the existing comment
        InspectionComment existingComment = inspectionCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));


        // Update fields
        existingComment.setTopic(topic);
        existingComment.setComment(comment);
        existingComment.setAuthor(author);
        existingComment.setCreatedAt(LocalDateTime.now()); // optional if you have this field

        // Save and return
        return inspectionCommentRepository.save(existingComment);
    }

    public void deleteComment(Long commentId) {


        // Find the comment
        InspectionComment existingComment = inspectionCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        // Perform delete
        inspectionCommentRepository.delete(existingComment);
    }



}
