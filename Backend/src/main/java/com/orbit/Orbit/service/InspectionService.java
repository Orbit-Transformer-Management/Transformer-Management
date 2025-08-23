package com.orbit.Orbit.service;

import com.orbit.Orbit.dto.InspectionRequest;
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
        Transformer transformer = transformerService.get(req.transformerNumber());
        inspection.setInspectionNumber(req.inspectionNumber());
        inspection.setTransformer(transformer); // FK via relation
        inspection.setInspectionDate(req.inspectionDate());
        inspection.setInspectionTime(req.inspectionTime());
        inspection.setBranch(req.branch());
        inspection.setMaintenanceDate(req.maintenanceDate());
        inspection.setMaintenanceTime(req.maintenanceTime());
        inspection.setStatus(req.status());
        return inspectionRepository.save(inspection);
    }

    public List<Inspection> get() {
        return inspectionRepository.findAll();
    }

    public Inspection get(String inspectionNumber) {
        return inspectionRepository.findById(inspectionNumber).orElse(null);
    }

    public boolean delete(String transformerNumber){
        if (!inspectionRepository.existsById(transformerNumber)) return false;
        inspectionRepository.deleteById(transformerNumber);
        return true;
    }

    public List<Inspection> getInspectionofTransformer(String transformerNumber){
        return inspectionRepository.findByTransformer_TransformerNumber(transformerNumber);
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

            Inspection inspection = this.get(inspectionNumber);
            inspection.setInspection_image_url(final_url);
            this.inspectionRepository.save(inspection);

        return final_url;


        } catch (IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }

    public Resource getInspectionImage(String InspectionNumber){
        Inspection Inspection = this.get(InspectionNumber);
        if (Inspection.getInspectionDate()==null) return null;
        String url = Inspection.getInspection_image_url(); // e.g. /files/Inspections/123/uuid.png
        Path path = Path.of("uploads", url.replace("/files/", ""));
        Resource resource = new org.springframework.core.io.PathResource(path);
        return resource;
    }



}
