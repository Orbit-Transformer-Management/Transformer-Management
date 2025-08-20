package com.orbit.Orbit.web;

import com.orbit.Orbit.model.Transformer;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TransformerController {

    private Transformer currectTransformer = new Transformer("1","1","1","2");

    @GetMapping("/api/v1/transformers/{transformerNumber}")
    public Transformer get(@PathVariable String transformerNumber){
        return currectTransformer;
    }

}
