package com.orbit.Orbit.web;

import com.orbit.Orbit.dto.InspectionRequest;
import com.orbit.Orbit.dto.InspectionResponse;
import com.orbit.Orbit.model.Inspection;
import com.orbit.Orbit.service.InspectionService;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collection;

@CrossOrigin(origins = "http://localhost:5173") // To fix the Cross Origin error
@RestController
public class InspectionController {


    private final InspectionService inspectionService;
    private String InspectionNumber;

    public InspectionController (InspectionService inspectionService){
        this.inspectionService = inspectionService;
    }


    @GetMapping("/api/v1/inspections")
    public Collection<Inspection> get(){
        return inspectionService.get();
    }

    @GetMapping("/api/v1/inspections/{inspectionNumber}")
    public Inspection get(@PathVariable String inspectionNumber){
        return inspectionService.get(inspectionNumber);
    }

    @GetMapping("/api/v1/transformers/{transformerNumber}/inspections")
    public Collection<Inspection> getInspectionofTransformer(@PathVariable String transformerNumber){
        return inspectionService.getInspectionofTransformer(transformerNumber);
    }

    @GetMapping("/api/v1/inspections/{inspectionNumber}/image")
    public ResponseEntity<Resource> getimage(@PathVariable String inspectionNumber){
        String fileName = "image.jpg";
        Resource image = inspectionService.getInspectionImage(inspectionNumber);
        if (image==null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG);
        ContentDisposition build = ContentDisposition.builder("inline")
                .filename(fileName)
                .build();
        headers.setContentDisposition(build);
        return ResponseEntity.ok()
                .headers(headers)
                .body(image);

    }



//    @PostMapping("/api/v1/inspections")
//    public String create(@RequestParam("inspectionNo") String inspectionNumber,
//                         @RequestParam("inspectionNo") String transformerNumber,
//                         @RequestParam("inspectionDate") String inspectionDate,
//                         @RequestParam("inspectionTime") String inspectionTime,
//                         @RequestParam("maintenanceDate") String maintenceDate,
//                         @RequestParam("maintenanceTime") String maintenceTime,
//                         @RequestParam("status") String status,
//                         @RequestParam("branch") String branch){
//        Inspection inspection = new Inspection(inspectionNumber,transformerNumber,inspectionDate,inspectionTime,branch,maintenceDate,maintenceTime,status);
//        inspectionService.save(inspection);
//        return inspection.getInspectionNumber(); // Spring will return it as JSON
//    }

    @PostMapping("/api/v1/inspections")
    public ResponseEntity<String> create(@RequestBody InspectionRequest inspectionRequest){
        inspectionService.save(inspectionRequest);
        return ResponseEntity
                .status(HttpStatus.CREATED)  // 201 Created
                .body("done");
    }

//    @PostMapping("/api/v1/inspections/{inspectionNumber}/image")
//    public String uploadImage(
//            @PathVariable String inspectionNumber,
//            @RequestPart("image") MultipartFile image){
//        String publicUrl = inspectionService.saveInspectionImage(inspectionNumber, image);
//        return publicUrl;
//    }

    @PostMapping("/api/v1/inspections/{inspectionNumber}/image")
    public ResponseEntity<Void> uploadImage(
            @PathVariable String inspectionNumber,
            @RequestPart("image") MultipartFile image){
        String publicUrl = inspectionService.saveInspectionImage(inspectionNumber,image);
        return ResponseEntity.ok().build();
    }




    @DeleteMapping("/api/v1/inspections/{inspectionNumber}")
    public void delete(@PathVariable String InspectionNumber){
        if(!inspectionService.delete(InspectionNumber)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

    }
}
