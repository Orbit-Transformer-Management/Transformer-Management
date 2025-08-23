package com.orbit.Orbit.repo;
import com.orbit.Orbit.model.Transformer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransformerRepo extends JpaRepository<Transformer,String> {

}