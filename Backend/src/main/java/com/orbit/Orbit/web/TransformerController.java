package com.orbit.Orbit.web;

import com.orbit.Orbit.model.Transformer;
import com.orbit.Orbit.service.TransformerService;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Path;
import java.util.Collection;
import java.util.UUID;

@RestController
public class TransformerController {


    private final TransformerService transformerService;
    private String transformerNumber;

    public TransformerController (TransformerService transformerService){
        this.transformerService = transformerService;
    }


    @GetMapping("/api/v1/transformers")
    public Collection<Transformer> get(){
        return transformerService.get();
    }
    @GetMapping("/api/v1/transformers/{transformerNumber}")
    public Transformer get(@PathVariable String transformerNumber){
        return transformerService.get(transformerNumber);
    }

    @GetMapping("/api/v1/transformers/{transformerNumber}/image")
    public ResponseEntity<Resource> getimage(@PathVariable String transformerNumber){
        String fileName = "image.jpg";
        Resource image = transformerService.getBaseImage(transformerNumber);
        if (image==null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG);
        ContentDisposition build = ContentDisposition.builder("inline")
                .filename(fileName)
                .build();
        headers.setContentDisposition(build);
        return ResponseEntity.ok()
                .headers(headers)
                .body(image);

    }



    @PostMapping("/api/v1/transformers")
    public String create(@RequestParam("poleNumber") String poleNumber,
                         @RequestParam("region") String region,
                         @RequestParam("type") String type){
        Transformer transformer = new Transformer();
        transformer.setTransformerNumber(UUID.randomUUID().toString());
        transformer.setPoleNumber(poleNumber);
        transformer.setRegion(region);
        transformer.setType(type);
        transformerService.save(transformer);
        return transformer.getTransformerNumber(); // Spring will return it as JSON
    }

    @PostMapping("/api/v1/transformers/{transformerNumber}/image")
    public String uploadImage(
            @PathVariable String transformerNumber,
            @RequestPart("image") MultipartFile image){
        String publicUrl = transformerService.saveBaseImage(transformerNumber, image);
        return publicUrl;
    }


    @DeleteMapping("/api/v1/transformers/{transformerNumber}")
    public void delete(@PathVariable String transformerNumber){
        if(!transformerService.delete(transformerNumber)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

    }
}
