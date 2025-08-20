package com.orbit.Orbit.web;

import com.orbit.Orbit.model.Transformer;
import com.orbit.Orbit.service.TransformerService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Collection;
import java.util.UUID;

@RestController
public class TransformerController {


    private final TransformerService transformerService;

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

    @PostMapping("/api/v1/transformers")
    public String create(@RequestBody Transformer transformer) {
        transformer.setTransformerNumber(UUID.randomUUID().toString());
        transformerService.save(transformer);
        return transformer.getTransformerNumber(); // Spring will return it as JSON
    }

    @DeleteMapping("/api/v1/transformers/{transformerNumber}")
    public void delete(@PathVariable String transformerNumber){
        if(!transformerService.delete(transformerNumber)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }

}
