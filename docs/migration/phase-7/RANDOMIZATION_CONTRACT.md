# Randomization and Replay Contract

## `ast-selection-v1`

The caller supplies opaque nonempty seed bytes. `AstSelectionV1Random` derives a domain-separated SHA-256 counter stream. Fisher–Yates shuffle consumes bounded integers from that stream. Bounded integers use rejection sampling over unsigned 32-bit values: values in the incomplete high-end interval are discarded before reduction. Consequently modulo reduction introduces no bias.

Candidate facts are sorted before shuffling, so input row, Set, Map, and object-key iteration order cannot affect replay. The algorithm version, template version, inventory facts, seed, and clock boundary together define replay; the pure selector itself has no clock. Identical versioned inputs produce identical assignments. Unsupported algorithm versions fail closed.

This module never creates, stores, logs, serializes, or decrypts production seeds. The snapshot transaction supplies secure production entropy, encrypts the seed under its authenticated versioned envelope contract, and restricts decryption to the authorized replay service. Tests use synthetic seeds and must not snapshot plaintext production material.
