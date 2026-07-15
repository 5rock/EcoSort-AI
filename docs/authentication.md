# Authentication Module

EcoSort AI employs a client-side authentication model. Because the application is strictly offline-first and currently operates without a centralized cloud backend, authentication is managed locally via IndexedDB.

## Local Authentication Flow
1. **Registration**: User provides an email, name, and password. The password is hashed using PBKDF2 (Web Crypto API) with a unique salt. The user record is stored securely in IndexedDB.
2. **Login**: User provides an email and password. The system retrieves the user record, hashes the provided password with the stored salt, and validates the match.
3. **Session Management**: Upon successful login, the session is managed in memory using Zustand (`authStore.ts`). 

## Guest Mode
We provide a "Guest Mode" for users who do not wish to create an account.
- Guest sessions are assigned a temporary ID (e.g., `GST-A1B2C3D4`) stored in `localStorage`.
- All scans performed by a guest are tagged with this ID.
- Upon guest logout, the system aggressively purges all associated IndexedDB records and thumbnails to ensure privacy.

## Security Considerations
- **PBKDF2 Hashing**: 100,000 iterations are used to mitigate brute-force attacks on the local database.
- **Zero-Knowledge Architecture**: The application never transmits passwords or personal data over the network.
