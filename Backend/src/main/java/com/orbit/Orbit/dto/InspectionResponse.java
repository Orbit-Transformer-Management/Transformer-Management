package com.orbit.Orbit.dto;


import lombok.Data;

import com.orbit.Orbit.model.Inspection;

@Data
public class InspectionResponse{
        private String inspectionNumber;
        private String transformerNumber;
        private String inspectionDate;
        private String inspectionTime;
        private String branch;
        private String maintenanceDate;
        private String maintenanceTime;
        private String status;

    public InspectionResponse(Inspection inspection) {
        this.inspectionNumber = inspection.getInspectionNumber();
        //this.transformerNumber = inspection.getTransformer().getTransformerNumber();
        String transformerNumber =
                (inspection.getTransformer() != null)
                        ? inspection.getTransformer().getTransformerNumber()
                        : "N/A";

        this.transformerNumber = transformerNumber; // Guard is its Null
        this.inspectionDate = inspection.getInspectionDate();
        this.inspectionTime = inspection.getInspectionTime();
        this.maintenanceDate = inspection.getMaintenanceDate();
        this.maintenanceTime = inspection.getMaintenanceTime();
        this.branch = inspection.getBranch();
        this.status = inspection.getStatus();
        //Complete this later
    }
}




//public record InspectionResponse(
//        String inspectionNumber,
//        String transformerNumber,
//        String inspectionDate,
//        String inspectionTime,
//        String branch,
//        String maintenanceDate,
//        String maintenanceTime,
//        String status
//) {
//
//
//}
