import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import PasswordPage from '../../src/routes/login/password/+page.svelte';

afterEach(() => cleanup());

describe('password setup UI', () => {
	it('shows and enforces the password length rule before submission', () => {
		render(PasswordPage, { form: null });

		expect(screen.getByText('Use at least 8 characters.')).toBeTruthy();
		const password = screen.getByLabelText(/^New password/) as HTMLInputElement;
		const confirmation = screen.getByLabelText(/^Confirm new password/) as HTMLInputElement;
		expect(password.minLength).toBe(8);
		expect(confirmation.minLength).toBe(8);
	});
});
