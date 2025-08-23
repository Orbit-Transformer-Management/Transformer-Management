package com.transformer.manage_transformers.transformer;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class TransformerService {

    private final transformerRepo transformerRepository;

    @Autowired
    public TransformerService(transformerRepo transformerRepository) {
        this.transformerRepository = transformerRepository;
    }

    public List<Transformer> getTransformers() {
        return transformerRepository.findAll();
    }

    //get by No
    public List<Transformer> getTransformersByName(String searchText) {
        return transformerRepository.findAll().stream()
        .filter(transformer -> transformer.getTransformerNo().toLowerCase().contains(searchText.toLowerCase()))
        .collect(Collectors.toList());
    }

    //get by poleNo
    public List<Transformer> getTransformersByPole(String poleNo) {
        return transformerRepository.findAll().stream()
        .filter(transformer -> poleNo.equals(transformer.getPoleNo()))
        .collect(Collectors.toList());
    }

    //get by Region
    public List<Transformer> getTransformersByRegion(String searchText) {
        return transformerRepository.findAll().stream()
        .filter(transformer -> transformer.getRegion().toLowerCase().contains(searchText.toLowerCase()))
                .collect(Collectors.toList());
    }

    //get by Type
    public List<Transformer> getTransformersByType(String searchText) {
        return transformerRepository.findAll().stream()
                .filter(transformer -> transformer.getType().toLowerCase().contains(searchText.toLowerCase()))
                .collect(Collectors.toList());
    }

    //get by content type
    public List<Transformer> getTransformersByContentType(String searchText) {
        return transformerRepository.findAll().stream()
                .filter(transformer -> transformer.getContentType().toLowerCase().contains(searchText.toLowerCase()))
                .collect(Collectors.toList());
    }

    //add transformer
    public Transformer addTransformer(Transformer transformer) {
        transformerRepository.save(transformer);
        return transformer;
    }

    //update transformer attributes
    public Transformer updateTransformer(Transformer transformer) {
        Optional<Transformer> existingTransformer = transformerRepository.findByTransformerNo(transformer.getTransformerNo());

        if (existingTransformer.isPresent()) {
            Transformer transformerToBeUpdated = existingTransformer.get();
            transformerToBeUpdated.setTransformerNo(transformer.getTransformerNo());
            transformerToBeUpdated.setPoleNo(transformer.getPoleNo());
            transformerToBeUpdated.setRegion(transformer.getRegion());
            transformerToBeUpdated.setType(transformer.getType());
            transformerToBeUpdated.setType(transformer.getContentType());
            transformerToBeUpdated.setBaselineImage(transformer.getBaselineImage());

            transformerRepository.save(transformerToBeUpdated);
            return transformerToBeUpdated;
        }
        return null;
    }


    //delete transformer
    @Transactional
    public void deleteTransformer(String TransformerNo) {
        transformerRepository.deleteByTransformerNo(TransformerNo);
    }



}
