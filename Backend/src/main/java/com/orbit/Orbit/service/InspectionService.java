package com.orbit.Orbit.service;

import com.orbit.Orbit.dto.InspectionRequest;
import com.orbit.Orbit.dto.InspectionResponse;
import com.orbit.Orbit.model.Inspection;
import com.orbit.Orbit.model.Transformer;
import com.orbit.Orbit.repo.InspectionRepo;
import com.orbit.Orbit.repo.TransformerRepo;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InspectionService {

    private final InspectionRepo inspectionRepository;

    private final TransformerService transformerService;

    public InspectionService(InspectionRepo inspectionRepository, TransformerService transformerService) {
        this.inspectionRepository = inspectionRepository;
        this.transformerService = transformerService;
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

    public boolean delete(String transformerNumber){
        if (!inspectionRepository.existsById(transformerNumber)) return false;
        inspectionRepository.deleteById(transformerNumber);
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
            this.inspectionRepository.save(inspection);

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



}
