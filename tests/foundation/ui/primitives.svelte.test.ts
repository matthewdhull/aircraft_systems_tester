import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import ErrorSummary from '../../../src/lib/components/ErrorSummary.svelte';
import LoadingState from '../../../src/lib/components/LoadingState.svelte';
import TextField from '../../../src/lib/components/TextField.svelte';

afterEach(() => cleanup());

describe('foundation form feedback', () => {
	it('associates field instructions and errors with the input', async () => {
		render(TextField, {
			id: 'staff-id',
			label: 'Staff identifier',
			description: 'Use the identifier assigned by your organization.',
			error: 'Enter a staff identifier.',
			required: true
		});

		const input = screen.getByRole<HTMLInputElement>('textbox', { name: /staff identifier/i });
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.getAttribute('aria-describedby')).toBe('staff-id-description staff-id-error');
		expect(document.querySelector('#staff-id-description')?.textContent).toBe(
			'Use the identifier assigned by your organization.'
		);
		expect(document.querySelector('#staff-id-error')?.textContent).toBe(
			'Enter a staff identifier.'
		);

		await fireEvent.input(input, { target: { value: 'staff-example' } });
		expect(input.value).toBe('staff-example');
	});

	it('links summary messages to their fields', () => {
		render(ErrorSummary, {
			errors: [
				{ fieldId: 'staff-id', message: 'Enter a staff identifier.' },
				{ message: 'Review the form before continuing.' }
			]
		});

		expect(screen.getByRole('alert').textContent).toContain('There is a problem');
		expect(
			screen.getByRole('link', { name: 'Enter a staff identifier.' }).getAttribute('href')
		).toBe('#staff-id');
	});

	it('announces loading state without exposing protected details', () => {
		render(LoadingState, { message: 'Loading assigned records…' });

		expect(screen.getByRole('status').textContent).toContain('Loading assigned records…');
	});
});
