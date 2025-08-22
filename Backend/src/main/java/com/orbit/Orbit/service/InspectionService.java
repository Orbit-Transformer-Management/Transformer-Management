package com.orbit.Orbit.service;

import com.orbit.Orbit.model.Inspection;
import com.orbit.Orbit.model.Transformer;
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
import java.util.Map;

@Service
public class InspectionService {

    private Map<String, Inspection> db = new HashMap<>(){{
        put("1", new Inspection("1","1","1","1","1","1","1","1"));
    }};



    public Collection<Inspection> get() {
        return db.values();
    }

    public Inspection get(String inspectionNumber) {
        return db.get(inspectionNumber);
    }



    public void save(Inspection inspection){
        db.put(inspection.getInspectionNumber(),inspection);
    }

    public boolean delete(String inspectionNumber){
        Inspection Inspection = db.remove(inspectionNumber);
        return Inspection != null;
    }


    public String saveInspectionImage(String InspectionNumber, MultipartFile image) {
        try {
            // Base directory: uploads/Inspections/{InspectionNumber}
            Path dir = Path.of("uploads", "inspections", InspectionNumber);
            Files.createDirectories(dir);

            // Create a safe filename with UUID to avoid collisions
            String original = image.getOriginalFilename();
            String filename = (original == null || original.isBlank()) ? "image" : original;

            Path dest = dir.resolve(filename);
            image.transferTo(dest);
            // Return public URL mapping (e.g., /files/Inspections/{InspectionNumber}/{filename})
            String final_url = "/files/inspections/" + InspectionNumber + "/" + filename;

            Inspection Inspection = db.get(InspectionNumber);
            Inspection.setInspection_image_url(final_url);
            return final_url;


        } catch (IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }

    public Resource getInspectionImage(String InspectionNumber){
        Inspection Inspection = db.get(InspectionNumber);
        if (Inspection.getInspectionDate()==null) return null;
        String url = Inspection.getInspection_image_url(); // e.g. /files/Inspections/123/uuid.png
        Path path = Path.of("uploads", url.replace("/files/", ""));
        Resource resource = new org.springframework.core.io.PathResource(path);
        return resource;
    }



}
