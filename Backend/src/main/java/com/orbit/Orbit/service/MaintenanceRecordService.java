package com.orbit.Orbit.service;

import com.orbit.Orbit.dto.MaintenanceReportRequest;
import com.orbit.Orbit.model.MaintenanceRecord;
import com.orbit.Orbit.model.Transformer;
import com.orbit.Orbit.repo.MaintenceRecordRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaintenanceRecordService {
    private final MaintenceRecordRepo maintenceRecordRepository;

    private final TransformerService transformerService;

    public MaintenanceRecordService(MaintenceRecordRepo maintenceRecordRepository, TransformerService transformerService) {
        this.maintenceRecordRepository = maintenceRecordRepository;
        this.transformerService = transformerService;
    }

    public List<MaintenanceRecord> getAllMaintenanceRecords() {
        return maintenceRecordRepository.findAll();
    }

    public MaintenanceRecord get(Long id) {
        return maintenceRecordRepository.findById(id).orElse(null);
    }


    public MaintenanceRecord save(MaintenanceReportRequest maintenanceRecordRequest) {
        MaintenanceRecord maintenanceRecord = new MaintenanceRecord();

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
        return maintenceRecordRepository.findByTransformerNumber(transformerNumber);
    }

}

