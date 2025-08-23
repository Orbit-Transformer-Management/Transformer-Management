package com.transformer.manage_transformers.transformer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TransformerInspectionService {
    private final transformerInspectionRepo transformerInspectionRepository;

    @Autowired
    public TransformerInspectionService(transformerInspectionRepo transformerInspectionRepository) {
        this.transformerInspectionRepository = transformerInspectionRepository;
    }

    // Get all inspections
    public List<TransformerInspection> getInspections() {
        return transformerInspectionRepository.findAll();
    }

    // Get inspection by inspection number
    public List<TransformerInspection> getInspectionByNumber(String inspectionNo) {
        return transformerInspectionRepository.findAll().stream()
                .filter(ins -> ins.getInspectionNo().toLowerCase().contains(inspectionNo.toLowerCase()))
                .collect(Collectors.toList());
    }


    // Get all inspections for a transformer number
    public List<TransformerInspection> getInspectionsByTransformer(String transformerNo) {
        return transformerInspectionRepository.findAll().stream()
                .filter(ins -> ins.getTransformer().getTransformerNo().toLowerCase()
                        .contains(transformerNo.toLowerCase()))
                .collect(Collectors.toList());
    }

    // Get inspections by exact date (have to change if need to search by month, year etc)
    public List<TransformerInspection> getInspectionsByDate(LocalDate date) {
        return transformerInspectionRepository.findAll().stream()
                .filter(ins -> ins.getInspectionDate() != null && ins.getInspectionDate().equals(date))
                .collect(Collectors.toList());
    }

    public List<TransformerInspection> getInspectionsByStatus(String searchText) {
        return transformerInspectionRepository.findAll().stream()
                .filter(ins -> ins.getStatus() != null && ins.getStatus().toLowerCase().contains(searchText.toLowerCase()))
                .collect(Collectors.toList());
    }
}
