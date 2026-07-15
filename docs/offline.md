# Offline Database Strategy

EcoSort AI is an offline-first Progressive Web Application. All user data, scan history, and settings are stored locally on the user's device.

## Dexie.js Integration
We use Dexie.js, a minimalist wrapper for IndexedDB, to handle asynchronous database operations efficiently.

### Schema (`offline/db.ts`)
The database (`EcoSortDB`) contains two primary stores:
1. **`users`**: Stores user credentials, salts, and metadata.
2. **`scans`**: Stores the complete scan history, including AI confidence scores, regional mapping, and image thumbnails.

## Repository Pattern
To decouple React components from the database layer, all database interactions are abstracted into Repositories:
- `usersRepository.ts`: Handles user CRUD operations.
- `historyRepository.ts`: Handles querying, adding, and deleting scan history records.
- `analyticsRepository.ts`: Aggregates scan data to provide dashboard statistics.
- `settingsRepository.ts`: Wraps `localStorage` for synchronous user preferences (e.g., theme, language).

## Image Storage Optimization
To prevent exhausting the browser's storage quota, full-resolution base64 images are **not** saved by default. 
When a scan is saved, the captured frame is downscaled to a `256x256` JPEG thumbnail (Quality 0.7). Users can optionally enable saving original images in the settings, but they are warned about the storage implications.
