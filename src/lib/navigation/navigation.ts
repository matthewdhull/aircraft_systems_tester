export type NavigationAudience = 'public' | 'staff';

export type NavigationItemId =
	| 'exam-access'
	| 'staff-login'
	| 'dashboard'
	| 'curriculum'
	| 'questions'
	| 'test-models'
	| 'generated-tests'
	| 'reports'
	| 'instructors';

export interface NavigationItem {
	id: NavigationItemId;
	label: string;
	href: string;
	audience: NavigationAudience;
	description: string;
}

export interface NavigationGroup {
	label: string;
	items: readonly NavigationItem[];
}

export const navigationGroups: readonly NavigationGroup[] = [
	{
		label: 'Access',
		items: [
			{
				id: 'exam-access',
				label: 'Exam access',
				href: '/exams/access',
				audience: 'public',
				description: 'Enter a published exam through the future roster-aware access flow.'
			},
			{
				id: 'staff-login',
				label: 'Staff sign in',
				href: '/login',
				audience: 'public',
				description: 'Sign in to the future server-authorized staff workspace.'
			}
		]
	},
	{
		label: 'Staff workspace',
		items: [
			{
				id: 'dashboard',
				label: 'Dashboard',
				href: '/dashboard',
				audience: 'staff',
				description: 'View assigned work and operational status.'
			},
			{
				id: 'curriculum',
				label: 'Curriculum',
				href: '/curriculum',
				audience: 'staff',
				description: 'Manage the future Phase, Task, Subtask, and Element hierarchy.'
			},
			{
				id: 'questions',
				label: 'Questions',
				href: '/questions',
				audience: 'staff',
				description: 'Author and review versioned question content.'
			},
			{
				id: 'test-models',
				label: 'Test models',
				href: '/test-models',
				audience: 'staff',
				description: 'Define and review reusable exam compositions.'
			},
			{
				id: 'generated-tests',
				label: 'Generated tests',
				href: '/generated-tests',
				audience: 'staff',
				description: 'View future generated-test history and publication status.'
			},
			{
				id: 'reports',
				label: 'Reports',
				href: '/reports',
				audience: 'staff',
				description: 'Open future assigned or permissioned reporting surfaces.'
			},
			{
				id: 'instructors',
				label: 'Instructor administration',
				href: '/instructors',
				audience: 'staff',
				description: 'Administer instructors when server authorization permits it.'
			}
		]
	}
] as const;

/**
 * Applies a server-provided presentation decision. This function never grants access: every
 * destination must independently enforce authentication, permission, and record scope.
 */
export function visibleNavigation(
	groups: readonly NavigationGroup[],
	visibleItemIds: ReadonlySet<NavigationItemId>
): NavigationGroup[] {
	return groups
		.map((group) => ({
			...group,
			items: group.items.filter((item) => visibleItemIds.has(item.id))
		}))
		.filter((group) => group.items.length > 0);
}
