package com.orbit.Orbit.service;

import com.orbit.Orbit.model.Transformer;
import org.springframework.stereotype.Service;

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



}
