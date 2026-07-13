import { cleanup, render, screen, waitFor, within } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import InstructorDetailPage from '../../../src/routes/admin/instructors/[id]/+page.svelte';
import InstructorListPage from '../../../src/routes/admin/instructors/+page.svelte';

afterEach(() => cleanup());

const user = {
	id: '10000000-0000-4000-8000-000000000002',
	employeeNumber: '00742',
	firstName: 'Synthetic',
	lastName: 'Instructor',
	status: 'active' as const,
	createdAt: '2026-07-12T18:00:00.000Z',
	updatedAt: '2026-07-12T18:00:00.000Z',
	retiredAt: null,
	roles: [{ id: 'role-instructor', code: 'instructor', displayName: 'Instructor' }]
};

const detailData = {
	principal: null,
	visibleNavigationItemIds: [],
	instructor: {
		...user,
		employeeNumberHistory: [
			{
				id: 'history-1',
				previousValue: '00741',
				replacementValue: '00742',
				changedByUserId: 'actor-1',
				changedAt: '2026-07-12T18:00:00.000Z',
				reason: 'Correction'
			}
		]
	},
	roles: user.roles
};

describe('instructor administration UI', () => {
	it('renders a responsive account table and labeled account form', () => {
		render(InstructorListPage, {
			data: { instructors: [user], principal: null, visibleNavigationItemIds: [] },
			form: null
		});

		expect(screen.getByRole('heading', { name: 'Instructors and users' })).toBeTruthy();
		const table = screen.getByRole('table');
		expect(within(table).getByRole('link', { name: 'Instructor, Synthetic' })).toBeTruthy();
		expect(screen.getByRole('textbox', { name: /employee number/i })).toBeTruthy();
		expect(screen.getByRole('textbox', { name: /first name/i })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Add pending account' })).toBeTruthy();
	});

	it('renders accessible errors linked to create fields and focuses the summary', async () => {
		render(InstructorListPage, {
			data: { instructors: [user], principal: null, visibleNavigationItemIds: [] },
			form: {
				operation: 'create',
				error: 'invalid_input',
				fields: [{ field: 'employeeNumber', message: 'Enter an employee number.' }],
				values: { employeeNumber: '', firstName: 'Synthetic', lastName: 'Instructor' }
			}
		});

		expect(screen.getByRole('alert').textContent).toContain('There is a problem');
		expect(
			screen.getByRole('link', { name: 'Enter an employee number.' }).getAttribute('href')
		).toBe('#create-employeeNumber');
		expect(
			screen.getByRole('textbox', { name: /employee number/i }).getAttribute('aria-invalid')
		).toBe('true');
		await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('alert')));
	});

	it('places employee-number conflicts in the focused error summary', async () => {
		render(InstructorListPage, {
			data: { instructors: [user], principal: null, visibleNavigationItemIds: [] },
			form: {
				operation: 'create',
				error: 'conflict',
				fields: [],
				values: { employeeNumber: '00742', firstName: 'Other', lastName: 'Person' }
			}
		});

		const summary = screen.getByRole('alert');
		expect(summary.textContent).toContain('That employee number is already in use.');
		expect(screen.getAllByRole('alert')).toHaveLength(1);
		await waitFor(() => expect(document.activeElement).toBe(summary));
	});

	it('renders lifecycle, role, correction, and history controls on the detail page', () => {
		render(InstructorDetailPage, {
			data: detailData,
			form: null
		});

		expect(screen.getByRole('heading', { name: 'Account lifecycle' })).toBeTruthy();
		expect(screen.getByRole('combobox', { name: 'New status' })).toBeTruthy();
		expect(screen.getByRole('combobox', { name: 'Role to grant' })).toBeTruthy();
		expect(screen.getByRole('textbox', { name: 'Reason for correction' })).toBeTruthy();
		const history = screen
			.getByRole('heading', { name: 'Employee number history' })
			.closest('section')!;
		expect(within(history).getByText('00741', { selector: 'strong' })).toBeTruthy();
		expect(within(history).getByText('00742', { selector: 'strong' })).toBeTruthy();
	});

	it('places final-administrator failures in the focused error summary', async () => {
		render(InstructorDetailPage, {
			data: detailData,
			form: {
				operation: 'changeStatus',
				error: 'final_active_administrator',
				fields: []
			}
		});

		const summary = screen.getByRole('alert');
		expect(summary.textContent).toContain(
			'This change would remove the final active administrator.'
		);
		expect(screen.getAllByRole('alert')).toHaveLength(1);
		await waitFor(() => expect(document.activeElement).toBe(summary));
	});
});
