package com.orbit.Orbit.service;

import com.orbit.Orbit.dto.InspectionResponse;
import com.orbit.Orbit.dto.MaintenanceReportRequest;
import com.orbit.Orbit.dto.MaintenceReportResponse;
import com.orbit.Orbit.model.Inspection;
import com.orbit.Orbit.model.MaintenanceRecord;
import com.orbit.Orbit.model.Transformer;
import com.orbit.Orbit.repo.InspectionRepo;
import com.orbit.Orbit.repo.MaintenceRecordRepo;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MaintenanceRecordService {
    private final MaintenceRecordRepo maintenceRecordRepository;

    private final TransformerService transformerService;
    private final InspectionService inspectionService;
    private final InspectionRepo inspectionRepository;

    public MaintenanceRecordService(MaintenceRecordRepo maintenceRecordRepository, TransformerService transformerService, InspectionService inspectionService, InspectionRepo inspectionRepository) {
        this.maintenceRecordRepository = maintenceRecordRepository;
        this.transformerService = transformerService;
        this.inspectionService = inspectionService;
        this.inspectionRepository = inspectionRepository;
    }

    public List<MaintenanceRecord> getAllMaintenanceRecords() {
        return maintenceRecordRepository.findAll();
    }

    public MaintenanceRecord get(Long id) {
        return maintenceRecordRepository.findById(id).orElse(null);
    }


    public MaintenanceRecord save(MaintenanceReportRequest maintenanceRecordRequest) {
        MaintenanceRecord maintenanceRecord = new MaintenanceRecord();
        List<String> inspectionIds = maintenanceRecordRequest.getInspectionsNumbers();
        List<Inspection> inspections = new ArrayList<>();
        for (String inspectionId : inspectionIds) {
            inspectionRepository.findById(inspectionId).ifPresent(inspections::add);
        }
        maintenanceRecord.setInspections(inspections);
        Transformer transformer = transformerService.get(maintenanceRecordRequest.getTransformerNumber());
        maintenanceRecord.setTransformer(transformer);
        maintenanceRecord.setVoltage(maintenanceRecordRequest.getVoltage());
        maintenanceRecord.setCurrent(maintenanceRecordRequest.getCurrent());
        maintenanceRecord.setRecommendedAction(maintenanceRecordRequest.getRecommendedAction());
        maintenanceRecord.setAdditionalRemarks(maintenanceRecordRequest.getAdditionalRemarks());
        maintenanceRecord.setOtherNotes(maintenanceRecordRequest.getOtherNotes());
        maintenanceRecord.setInspectorName(maintenanceRecordRequest.getInspectorName());
        return maintenceRecordRepository.save(maintenanceRecord);
    }

    public List<MaintenanceRecord> getMaintenanceRecordsByTransformerNumber(String transformerNumber) {
        return maintenceRecordRepository.findByTransformer_TransformerNumber(transformerNumber);
    }

}

