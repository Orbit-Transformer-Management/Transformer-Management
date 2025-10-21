package com.orbit.Orbit.web;

import com.orbit.Orbit.dto.*;
import com.orbit.Orbit.model.*;
import com.orbit.Orbit.service.DetectsService;
import com.orbit.Orbit.service.InspectionService;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collection;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173") // To fix the Cross Origin error
@RestController
public class InspectionController {


    private final InspectionService inspectionService;
    private final DetectsService detectsService;
    private String InspectionNumber;

    public InspectionController (InspectionService inspectionService, DetectsService detectsService){
        this.inspectionService = inspectionService;
        this.detectsService = detectsService;
    }


    @GetMapping("/api/v1/inspections")
    public ResponseEntity<List<InspectionResponse>> get() {
        List<InspectionResponse> inspections = inspectionService.get();

        if (inspections.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204 No Content
        }

        return ResponseEntity.ok(inspections); // 200 OK + list
    }


    @GetMapping("/api/v1/inspections/{inspectionNumber}")
    public ResponseEntity<InspectionResponse> get(@PathVariable String inspectionNumber) {
        InspectionResponse response = inspectionService.get(inspectionNumber);

        if (response == null) {
            return ResponseEntity.notFound().build(); // 404
        }

        return ResponseEntity.ok(response); // 200 + body
    }

    @GetMapping("/api/v1/transformers/{transformerNumber}/inspections")
    public ResponseEntity<List<InspectionResponse>> getInspectionOfTransformer(
            @PathVariable String transformerNumber) {

        List<InspectionResponse> inspections = inspectionService.getInspectionOfTransformer(transformerNumber);

        if (inspections.isEmpty()) {
            return ResponseEntity.noContent().build(); //
        }

        return ResponseEntity.ok(inspections);
    }
    //Mihiran Fixed the responses upto here.

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

    //Analyze

    @GetMapping("/api/v1/inspections/{inspectionNumber}/analyze")
    public ResponseEntity<List<InspectionModelDetects>> analyzeImage(@PathVariable String inspectionNumber) {
        List<InspectionModelDetects> detections = detectsService.get(inspectionNumber);
        return ResponseEntity.ok(detections);
    }

    @GetMapping("/api/v1/inspections/{inspectionNumber}/analyze/timeline")
    public ResponseEntity<List<InspectionDetectsTimeline>> getTimeline(@PathVariable String inspectionNumber) {
        List<InspectionDetectsTimeline> detections = detectsService.timelineget(inspectionNumber);
        return ResponseEntity.ok(detections);
    }

    @PutMapping("/api/v1/inspections/analyze/{detectId}")
    public ResponseEntity<InspectionModelDetects> updatePrediction(
            @PathVariable String detectId,
            @RequestBody UpdateDetectionRequest req) {

        InspectionModelDetects updated = detectsService.update(req,detectId);
        // Return it back
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/api/v1/inspections/{inspectionNumber}/analyze")
    public ResponseEntity<InspectionModelDetects> adddetect(
            @PathVariable String inspectionNumber,
            @RequestBody UpdateDetectionRequest req) {
        InspectionModelDetects detect =  detectsService.add(req,inspectionNumber);
        return ResponseEntity.ok(detect);
    }

    @DeleteMapping("/api/v1/inspections/analyze/{detectId}")
    public ResponseEntity<Void> deleteDetectionByDetectId(
            @PathVariable String detectId,
            @RequestBody UpdateDetectionRequest req) {
        detectsService.deleteByDetectId(req,detectId); // implement below
        return ResponseEntity.noContent().build(); // 204
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

    @PatchMapping ("/api/v1/inspections/{inspectionNumber}")
    public ResponseEntity<InspectionResponse> partialUpdate(
            @PathVariable String inspectionNumber,
            @RequestBody InspectionRequest inspectionUpdate) {

        InspectionResponse updatedInspectionResponse = inspectionService.update(inspectionNumber,inspectionUpdate);
        return ResponseEntity
                .ok(updatedInspectionResponse); // Returns 200 OK with the updated object
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
    public void delete(@PathVariable String inspectionNumber){
        if(!inspectionService.delete(inspectionNumber)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

    }


    //Comments
    @GetMapping("/api/v1/inspections/{inspectionNumber}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable String inspectionNumber) {
        return ResponseEntity.ok(inspectionService.getComments(inspectionNumber));
    }

    @PostMapping("/api/v1/inspections/{inspectionNumber}/comments")
    public ResponseEntity<InspectionComment> addComment(
            @PathVariable String inspectionNumber,
            @RequestBody InspectionComment request) {

        InspectionComment saved = inspectionService.addComment(
                inspectionNumber,
                request.getTopic(),
                request.getComment(),
                request.getAuthor()

        );

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/api/v1/inspections/comments/{commentId}")
    public ResponseEntity<InspectionComment> updateComment(
            @PathVariable Long commentId,
            @RequestBody InspectionComment updatedRequest) {

        InspectionComment updated = inspectionService.updateComment(
                commentId,
                updatedRequest.getTopic(),
                updatedRequest.getComment(),
                updatedRequest.getAuthor()
        );

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/v1/inspections/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId) {

        inspectionService.deleteComment(commentId);
        return ResponseEntity.noContent().build(); // returns 204 No Content
    }
}
