package com.orbit.Orbit.service;

import com.orbit.Orbit.model.Transformer;
import com.orbit.Orbit.repo.TransformerRepo;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.List;

@Service
public class TransformerService {

//    private Map<String, Transformer> db = new HashMap<>(){{
//        put("1", new Transformer("1","2","2","2","1"));
//    }};

    private final TransformerRepo transformerRepository;

    public TransformerService(TransformerRepo transformerRepository) {
        this.transformerRepository = transformerRepository;
    }

    public Transformer save(Transformer transformer){
        return transformerRepository.save(transformer);
    }

    public Transformer update(String transformerNumber, Transformer updates) {
        // 1. Find the existing transformer in the database or throw an exception.
        Transformer existingTransformer = transformerRepository.findById(transformerNumber)
                .orElseThrow(() -> new RuntimeException("Transformer not found with id: " + transformerNumber));

        // 2. Conditionally update each field if a new value is provided.
        if (updates.getPoleNumber() != null) {
            existingTransformer.setPoleNumber(updates.getPoleNumber());
        }
        if (updates.getRegion() != null) {
            existingTransformer.setRegion(updates.getRegion());
        }
        if (updates.getType() != null) {
            existingTransformer.setType(updates.getType());
        }
        if (updates.getLocationDetails() != null) {
            existingTransformer.setLocationDetails(updates.getLocationDetails());
        }
        if (updates.getContent_type() != null) {
            existingTransformer.setContent_type(updates.getContent_type());
        }
        if (updates.getBase_image_url() != null) {
            existingTransformer.setBase_image_url(updates.getBase_image_url());
        }

        // 3. Save the updated entity to the database and return it.
        return transformerRepository.save(existingTransformer);
    }

    public List<Transformer> get() {
        return transformerRepository.findAll();
    }

    public Transformer get(String transformerNumber) {
        return transformerRepository.findById(transformerNumber).orElse(null);
    }

    public boolean delete(String transformerNumber){
        if (!transformerRepository.existsById(transformerNumber)) return false;
        transformerRepository.deleteById(transformerNumber);
        return true;
    }


    public String saveBaseImage(String transformerNumber, MultipartFile image) {
        try {
            // Base directory: uploads/transformers/{transformerNumber}
            Path dir = Path.of("uploads", "transformers", transformerNumber);
            Files.createDirectories(dir);

            // Create a safe filename with UUID to avoid collisions
            String original = image.getOriginalFilename();
            String filename = (original == null || original.isBlank()) ? "image" : original;

            Path dest = dir.resolve(filename);
            image.transferTo(dest);
            // Return public URL mapping (e.g., /files/transformers/{transformerNumber}/{filename})
            String final_url = "/files/transformers/" + transformerNumber + "/" + filename;

            Transformer transformer = this.get(transformerNumber);
            transformer.setBase_image_url(final_url);
            this.save(transformer);
            return final_url;


        } catch (IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }

    public Resource getBaseImage(String transformerNumber){
        Transformer transformer = this.get(transformerNumber);
        if (transformer.getBase_image_url()==null) return null;
        String url = transformer.getBase_image_url(); // e.g. /files/transformers/123/uuid.png
        Path path = Path.of("uploads", url.replace("/files/", ""));
        Resource resource = new org.springframework.core.io.PathResource(path);
        return resource;
    }

}
