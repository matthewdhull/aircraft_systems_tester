# Phase 7 Generation Security

## Secret boundaries

Generation obtains a fresh 256-bit seed and access-code entropy through injected cryptographically secure sources. Plaintext seeds and raw access codes are never database fields, audit metadata, URLs, logs, projections, or fixtures. The raw access code exists only in the post-commit generation result; ordinary detail and reload projections cannot reconstruct it.

The seed envelope version is `ast-seed-aes-256-gcm-v1`. AES-256-GCM binds the exam UUID, template-version UUID, and selection algorithm version as authenticated additional data. Persistence separates envelope version, key identifier, and ciphertext. Replay requires an explicitly authorized service before decryption; possession of a detail projection is insufficient.

Access codes use a cryptographically generated 32-symbol alphabet with rejection sampling and are stored as `ast-code-hmac-sha256-v1` keyed digests. The key must contain at least 256 bits. An unkeyed fast digest is not permitted for this low-entropy value. Verification uses constant-time digest comparison.

## Configuration and rotation

Shared configuration supplies a base64 32-byte seed key, a non-secret key identifier, and a base64 access-code HMAC key of at least 32 bytes. Production fails closed for missing, malformed, or short key material. Development and tests use ignored synthetic configuration and injected entropy; tracked reusable production defaults are forbidden.

Rotation introduces a new key identifier for writes while retaining old decrypt-only seed keys for authorized replay. Envelope and protection versions are independently versioned. Key material is validated without being included in validation errors or redacted configuration views.

## Failure behavior

Seed encryption, access-code protection, audit insertion, snapshot writes, and selection all execute within the caller-owned immediate database transaction. Any failure rolls back the header, snapshots, protected values, and success audit. A raw code is returned only after the transaction commits successfully.
