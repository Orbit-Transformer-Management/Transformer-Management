package com.transformer.manage_transformers.transformer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface transformerRepo extends JpaRepository<Transformer,String> {
    void deleteByTransformerNo(String TransformerNo);
    Optional<Transformer> findByTransformerNo(String TransformerNo);
}
