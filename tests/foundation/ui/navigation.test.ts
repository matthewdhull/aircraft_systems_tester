import { describe, expect, it } from 'vitest';
import {
	navigationGroups,
	visibleNavigation,
	type NavigationItemId
} from '../../../src/lib/navigation/navigation';

describe('navigation presentation contract', () => {
	it('contains only the approved Phase 2 shell destinations', () => {
		const ids = navigationGroups.flatMap((group) => group.items.map((item) => item.id));

		expect(ids).toEqual([
			'exam-access',
			'staff-login',
			'dashboard',
			'curriculum',
			'questions',
			'test-models',
			'generated-tests',
			'reports',
			'instructors'
		]);
	});

	it('can apply a server-provided visibility decision without mutating the configuration', () => {
		const visible = new Set<NavigationItemId>(['exam-access', 'dashboard', 'reports']);
		const filtered = visibleNavigation(navigationGroups, visible);

		expect(filtered.flatMap((group) => group.items.map((item) => item.id))).toEqual([
			'exam-access',
			'dashboard',
			'reports'
		]);
		expect(navigationGroups.flatMap((group) => group.items)).toHaveLength(9);
	});
});
