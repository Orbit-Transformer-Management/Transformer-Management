# Edited Detection Tracking Feature

## Overview
This feature adds visual indication when a model-generated detection annotation has been edited by an inspector. When an inspector modifies a bounding box (position, size, or classification) that was originally detected by the ML model, an "Edited" badge appears next to the "Model Generated" badge.

## Changes Made

### Backend Changes

#### 1. Database Schema (`InspectionModelDetects` model)
- Added `isEdited` boolean field (default: `false`)
- Automatically set to `true` when a detection is updated via the edit endpoint

#### 2. Service Layer (`DetectsService.java`)
- Updated `update()` method to set `isEdited = true` when a detection is modified
- Updated `getAllDetects()` to include `isEdited` in response mapping

#### 3. DTOs
- `DetectionResponse.java`: Added `isEdited` field with getter/setter
- `UpdateDetectionRequest.java`: No changes needed (existing fields sufficient)

#### 4. Database Migration
- Created migration file: `database_migrations/add_is_edited_column.sql`
- Adds `is_edited` column to `inspection_model_detects` table
- Sets default value to `FALSE` for existing records

### Frontend Changes

#### 1. TypeScript Interfaces
- Updated `Prediction` interface to include `isEdited?: boolean` field
- Updated `InspectionModelDetects` type to include `isEdited?: boolean | null`

#### 2. Data Fetching
- Modified `fetchPredictions()` to map `isEdited` from backend response
- Defaults to `false` if not present in backend data

#### 3. UI Components
- Added "Edited" badge that displays next to "Model Generated" badge
- Badge styling: Orange background (`bg-orange-100 text-orange-700 ring-1 ring-orange-200`)
- Only shows when:
  - Detection is model-generated (not inspector-detected)
  - `isEdited` flag is `true`

## Visual Example

Before edit:
```
[Fault 1] [Faulty] [Model Generated]
```

After edit:
```
[Fault 1] [Faulty] [Model Generated] [Edited]
```

## How It Works

1. **Initial Detection**: Model detects anomalies, all have `isEdited = false`
2. **User Edits**: Inspector adjusts bounding box (position/size) or changes classification
3. **Backend Update**: `DetectsService.update()` sets `isEdited = true` and saves to database
4. **Timeline Entry**: Edit action is logged in `inspection_detects_timeline` table
5. **UI Refresh**: Frontend fetches updated data and displays "Edited" badge
6. **Persistence**: `isEdited` flag persists in database for future sessions

## Database Migration Instructions

### For MySQL/MariaDB:
```sql
-- Run the migration file
source Backend/database_migrations/add_is_edited_column.sql;
```

### For PostgreSQL:
```sql
-- Run the migration file
\i Backend/database_migrations/add_is_edited_column.sql
```

### For H2 (Development):
The migration will be applied automatically via JPA schema update if configured.

Alternatively, run manually through H2 console:
```sql
ALTER TABLE inspection_model_detects ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;
```

## Testing Checklist

- [ ] Backend: Verify `isEdited` column exists in database
- [ ] Backend: Edit a detection and verify `isEdited` is set to `true`
- [ ] Backend: Create new detection and verify `isEdited` defaults to `false`
- [ ] Frontend: Load page and verify no "Edited" badges initially
- [ ] Frontend: Edit a model-generated detection
- [ ] Frontend: Verify "Edited" badge appears after edit
- [ ] Frontend: Verify "Edited" badge persists after page refresh
- [ ] Frontend: Verify inspector-detected annotations don't show "Edited" badge

## API Response Example

```json
{
  "detectId": 123,
  "inspectionNumber": "INS001",
  "width": 100,
  "height": 80,
  "x": 250,
  "y": 300,
  "confidence": 0.95,
  "classId": 2,
  "className": "pf",
  "detectionId": "pred-001",
  "parentId": "image",
  "isEdited": true
}
```

## Future Enhancements

1. Track edit history (who edited, when, what changed)
2. Allow reverting to original model prediction
3. Show diff visualization between original and edited detection
4. Track confidence score changes
5. Export edited vs non-edited statistics

## Related Files

- `Backend/src/main/java/com/orbit/Orbit/model/InspectionModelDetects.java`
- `Backend/src/main/java/com/orbit/Orbit/service/DetectsService.java`
- `Backend/src/main/java/com/orbit/Orbit/dto/DetectionResponse.java`
- `Backend/database_migrations/add_is_edited_column.sql`
- `frontend/src/pages/InspectionUploadPage.tsx`
