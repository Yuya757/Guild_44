# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Guild_44 is a React Native / Expo mobile app (with web support) whose central feature is **face recognition for SNS post tagging**. A user takes/uploads a photo, the app sends it to an AWS-hosted face-recognition API, and recognized faces map to members whose emails are used to prefill "tag" / co-posting / consent-request flows for scheduled social-media posts. UI strings are in Japanese.

The repo has three top-level pieces:
- `frontend/` — Expo app (TypeScript, expo-router)
- `backend/` — a single AWS Lambda function (Python) behind API Gateway
- `environment/` — Docker Compose setup (see "Docker" caveat below)

## Commands

All `npm` commands run from `frontend/`:

```bash
cd frontend
npm install
npm run dev           # cross-env EXPO_NO_TELEMETRY=1 expo start
npm run build:web     # expo export --platform web → outputs to frontend/dist
npm run lint          # expo lint
```

No test framework is configured. There is no typecheck script — run `npx tsc --noEmit` directly if needed.

Ad-hoc API smoke test: `frontend/utils/testApiConnection.js` (run with `node`).

**Docker is documented but known-broken** (see `environment/DOCKER-README.md`: QR codes, host networking on Windows, and volume-mounted `node_modules` all have issues). Default to local dev with `npm run dev` unless explicitly fixing Docker.

## Architecture

### Frontend routing (expo-router, file-based)

`frontend/app/` uses expo-router v4 with `typedRoutes` enabled. Structure:

- `_layout.tsx` — root Stack; loads Inter fonts and gates rendering on font load
- `(tabs)/` — bottom-tab group: `index` (home), `notifications`, `scheduled`, `search`
- Top-level screens (outside tabs) handle modal-ish flows: `create-scheduled-post`, `face-recognition-simple`, `photo-editor`, `consent-form`, `new-request`, `permission-requests`, `scheduled-posts`, etc.
- Dynamic routes live in folders as `[id].tsx`: `edit-scheduled-post/[id].tsx`, `permission-request/[id].tsx`, `request-details/[id].tsx`, `scheduled-post-details/[id].tsx`

Navigation between face recognition and the caller uses `router.push` with a `returnTo` param; results flow back via query params, not a shared store. See `face-recognition-simple.tsx` for the pattern.

### Face-recognition data flow

1. Screen picks an image via `expo-image-picker`, reads it with `expo-file-system`, converts to base64.
2. `utils/apiService.ts#recognizeFacesFromImage` POSTs `{ image_base64str, threshold: 80.0 }` with an `x-api-key` header to `Constants.expoConfig.extra.apiUrl` (defaults to the AWS API Gateway URL hardcoded in `app.json`).
3. Backend (`backend/lambda_function.py`) decodes base64 → `rekognition.detect_faces` to find bounding boxes → masks all-but-one face per copy → `search_faces_by_image` against collection `face-recognition-authentication-collection` → looks up each matched `FaceId` in DynamoDB table `Member` via GSI `FaceId-index`.
4. Response shape: `{ status, message, timestamp, faces: [{ face_id, similarity, member_info }] }`. `member_info` uses DynamoDB's wire format (`{ S: "..." }`, `{ M: { ... } }`, `{ N: "..." }`) — the frontend parses this directly in `getSuggestedEmails` / `getFaceCoordinates`, so do not assume plain values.
5. One gotcha: the Lambda double-encodes — it calls `json.dumps` on `result['body']` which is already a JSON string. `apiService.ts` defends against this with `typeof data === 'string' ? JSON.parse(data) : data`. Preserve both sides of this contract if editing either.
6. Email field is `member_info['e-mail']` (hyphenated), not `Email`. Mock data in `utils/mockApiResponse.ts` uses `Email` and is therefore inconsistent with production — if touching mocks, align the field name.

### Configuration

- `frontend/app.json` holds `extra.apiUrl` and `extra.apiKey`. The API key is committed and also hardcoded as a fallback in `apiService.ts`. Treat it as already-public; do not introduce a "secure" path that pretends otherwise without coordinating with the backend owner.
- `frontend/metro.config.js` sets `disableHierarchicalLookup = true` and pins `nodeModulesPaths` to the project's own `node_modules` only — do not remove this without understanding why (it prevents Metro from walking up into parent directories).
- `frontend/babel.config.js` requires `react-native-reanimated/plugin` to be **last** in the plugins list (standard Reanimated requirement).
- `tsconfig.json` extends `expo/tsconfig.base`, has `strict: true`, and aliases `@/*` to the frontend root.

### Backend deployment model

`backend/lambda_function.py` is a single-file Lambda. There is no IaC, packaging script, or CI here — changes must be deployed to AWS manually. The function depends on `boto3` (Lambda-provided) and `Pillow` (must be supplied via a Lambda layer or deployment package). Env vars referenced in the backend README (`COLLECTION_ID`, `TABLE_NAME`, `GSI_NAME`) are *not* actually read by the code — the values are hardcoded as module-level constants. If you change one, change both.

## Conventions worth knowing

- UI copy, comments, and commit messages are written in Japanese; match the existing language in user-facing strings.
- Screens are large single files (many are 15–50 KB) with inline `StyleSheet.create`. This is the established pattern — don't split them up opportunistically.
- The `(tabs)` group uses `lucide-react-native` icons; spread `{color}` via `{...{color} as any}` to sidestep a type mismatch in the current Expo/RN versions (see `app/(tabs)/_layout.tsx`).
