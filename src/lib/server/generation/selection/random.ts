import { createHash } from 'node:crypto';

import type { SeededRandomSource } from './types.js';

/** A version-local deterministic stream. It is not an entropy source. */
export class AstSelectionV1Random implements SeededRandomSource {
	readonly #seed: Uint8Array;
	#counter = 0n;
	#block = new Uint8Array();
	#offset = 0;

	constructor(seed: Uint8Array) {
		if (seed.length === 0) throw new TypeError('A non-empty seed is required');
		this.#seed = Uint8Array.from(seed);
	}

	#refill(): void {
		const counter = Buffer.alloc(8);
		counter.writeBigUInt64BE(this.#counter++);
		this.#block = createHash('sha256')
			.update('aircraft-systems-tester:ast-selection-v1\0', 'utf8')
			.update(this.#seed)
			.update(counter)
			.digest();
		this.#offset = 0;
	}

	nextUint32(): number {
		if (this.#offset + 4 > this.#block.length) this.#refill();
		const value = new DataView(
			this.#block.buffer,
			this.#block.byteOffset + this.#offset,
			4
		).getUint32(0);
		this.#offset += 4;
		return value;
	}

	nextBoundedInt(exclusiveUpperBound: number): number {
		if (
			!Number.isSafeInteger(exclusiveUpperBound) ||
			exclusiveUpperBound <= 0 ||
			exclusiveUpperBound > 2 ** 32
		) {
			throw new RangeError('Bound must be an integer from 1 through 2^32');
		}
		const range = 2 ** 32;
		const limit = range - (range % exclusiveUpperBound);
		let value: number;
		do value = this.nextUint32();
		while (value >= limit);
		return value % exclusiveUpperBound;
	}

	shuffle<T>(values: readonly T[]): T[] {
		const result = [...values];
		for (let index = result.length - 1; index > 0; index -= 1) {
			const swapIndex = this.nextBoundedInt(index + 1);
			[result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
		}
		return result;
	}
}
