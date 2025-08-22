package com.orbit.Orbit.web;

import com.orbit.Orbit.model.Inspection;
import com.orbit.Orbit.service.InspectionService;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.UUID;

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

    @GetMapping("/api/v1/inspections/{inspectionNumber}/image")
    public ResponseEntity<Resource> getimage(@PathVariable String InspectionNumber){
        String fileName = "image.jpg";
        Resource image = inspectionService.getInspectionImage(InspectionNumber);
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



    @PostMapping("/api/v1/inspections")
    public String create(@RequestParam("inspectionNumber") String inspectionNumber,
                         @RequestParam("transformerNumber") String transformerNumber,
                         @RequestParam("inspectionDate") LocalDate inspectionDate,
                         @RequestParam("inspectionTime") LocalTime inspectionTime){
        Inspection inspection = new Inspection("1", "2", "2", LocalDate.of(2025, 8, 22), LocalTime.of(14, 30));
        inspection.setInspectionNumber(UUID.randomUUID().toString());
        inspection.setTransformerNumber(transformerNumber);
        inspection.setInspectionDate(inspectionDate);
        inspection.setInspectionTime(inspectionTime);
        inspectionService.save(inspection);
        return inspection.getInspectionNumber(); // Spring will return it as JSON
    }

    @PostMapping("/api/v1/inspections/{inspectionNumber}/image")
    public String uploadImage(
            @PathVariable String inspectionNumber,
            @RequestPart("image") MultipartFile image){
        String publicUrl = inspectionService.saveInspectionImage(inspectionNumber, image);
        return publicUrl;
    }


    @DeleteMapping("/api/v1/inspections/{inspectionNumber}")
    public void delete(@PathVariable String InspectionNumber){
        if(!inspectionService.delete(InspectionNumber)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

    }
}
