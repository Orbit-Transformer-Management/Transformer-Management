package com.orbit.Orbit.service;

import com.orbit.Orbit.model.Transformer;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@Service
public class TransformerService {

    private Map<String, Transformer> db = new HashMap<>(){{
        put("1", new Transformer("1","2","2","2"));
    }};

    

    public Collection<Transformer> get() {
        return db.values();
    }

    public Transformer get(String transformerNumber) {
        return db.get(transformerNumber);
    }



    public void save(Transformer transformer){
        db.put(transformer.getTransformerNumber(),transformer);
    }

    public boolean delete(String transformerNumber){
        Transformer transformer = db.remove(transformerNumber);
        return transformer != null;
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

            Transformer transformer = db.get(transformerNumber);
            transformer.setBase_image_url(final_url);
            return final_url;


        } catch (IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }

    public Resource getBaseImage(String transformerNumber){
        Transformer transformer = db.get(transformerNumber);
        if (transformer.getBase_image_url()==null) return null;
        String url = transformer.getBase_image_url(); // e.g. /files/transformers/123/uuid.png
        Path path = Path.of("uploads", url.replace("/files/", ""));
        Resource resource = new org.springframework.core.io.PathResource(path);
        return resource;
    }



}
