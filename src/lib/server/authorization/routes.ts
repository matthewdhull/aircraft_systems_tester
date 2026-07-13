import type { PermissionCode } from './policy.js';

export type RouteAudience =
	| 'public'
	| 'authenticated'
	| 'instructor-capable'
	| 'question-author'
	| 'curriculum-manager'
	| 'administrator';

export interface RouteMutationPolicy {
	name: string;
	audience: RouteAudience;
	permission?: PermissionCode;
}

export interface RoutePolicy {
	pattern: string;
	methods: readonly string[];
	audience: RouteAudience;
	permission?: PermissionCode;
	mutations: readonly RouteMutationPolicy[];
}

export const ROUTE_POLICIES: readonly RoutePolicy[] = Object.freeze([
	{ pattern: '/', methods: ['GET'], audience: 'public', mutations: [] },
	{ pattern: '/health', methods: ['GET'], audience: 'public', mutations: [] },
	{ pattern: '/ready', methods: ['GET'], audience: 'public', mutations: [] },
	{
		pattern: '/login',
		methods: ['GET', 'POST'],
		audience: 'public',
		mutations: [{ name: 'login', audience: 'public' }]
	},
	{
		pattern: '/login/password',
		methods: ['GET', 'POST'],
		audience: 'public',
		mutations: [{ name: 'setPassword', audience: 'public' }]
	},
	{
		pattern: '/logout',
		methods: ['POST'],
		audience: 'authenticated',
		mutations: [{ name: 'logout', audience: 'authenticated' }]
	},
	{
		pattern: '/admin/instructors',
		methods: ['GET', 'POST'],
		audience: 'administrator',
		permission: 'users.view',
		mutations: [{ name: 'create', audience: 'administrator', permission: 'users.create' }]
	},
	{
		pattern: '/admin/instructors/[id]',
		methods: ['GET', 'POST'],
		audience: 'administrator',
		permission: 'users.view',
		mutations: [
			{ name: 'edit', audience: 'administrator', permission: 'users.edit' },
			{ name: 'correctEmployeeNumber', audience: 'administrator', permission: 'users.edit' },
			{ name: 'changeStatus', audience: 'administrator', permission: 'users.lifecycle' },
			{ name: 'grantRole', audience: 'administrator', permission: 'users.roles.manage' },
			{ name: 'revokeRole', audience: 'administrator', permission: 'users.roles.manage' }
		]
	},
	{
		pattern: '/admin/curriculum',
		methods: ['GET', 'POST'],
		audience: 'curriculum-manager',
		permission: 'curriculum.manage',
		mutations: [
			'createNode',
			'createVersion',
			'updateDraft',
			'submitReview',
			'reviewVersion',
			'publishVersion',
			'retireVersion',
			'deleteDraft',
			'reorderSiblings'
		].map((name) => ({
			name,
			audience: 'curriculum-manager' as const,
			permission: 'curriculum.manage' as const
		}))
	},
	{
		pattern: '/admin/curriculum/bloom',
		methods: ['GET', 'POST'],
		audience: 'curriculum-manager',
		permission: 'curriculum.manage',
		mutations: [
			'createLevel',
			'updateLevel',
			'publishLevel',
			'retireLevel',
			'deleteLevel',
			'createVerb',
			'updateVerb',
			'publishVerb',
			'retireVerb',
			'deleteVerb'
		].map((name) => ({
			name,
			audience: 'curriculum-manager' as const,
			permission: 'curriculum.manage' as const
		}))
	},
	{
		pattern: '/admin/curriculum/mappings',
		methods: ['GET', 'POST'],
		audience: 'curriculum-manager',
		permission: 'curriculum.manage',
		mutations: ['proposeMapping', 'approveMapping', 'rejectMapping', 'retireMapping'].map(
			(name) => ({
				name,
				audience: 'curriculum-manager' as const,
				permission: 'curriculum.manage' as const
			})
		)
	},
	{
		pattern: '/questions',
		methods: ['GET', 'POST'],
		audience: 'question-author',
		permission: 'questions.view',
		mutations: [
			{ name: 'createQuestion', audience: 'question-author', permission: 'questions.create' }
		]
	},
	{
		pattern: '/questions/[id]',
		methods: ['GET', 'POST'],
		audience: 'question-author',
		permission: 'questions.view',
		mutations: [
			...['updateDraft', 'createVersion', 'submitReview', 'deleteDraft', 'proposeFutureLink'].map(
				(name) => ({
					name,
					audience: 'question-author' as const,
					permission: 'questions.create' as const
				})
			),
			{
				name: 'reviewVersion',
				audience: 'question-author',
				permission: 'questions.review'
			},
			{
				name: 'publishVersion',
				audience: 'question-author',
				permission: 'questions.publish'
			},
			{
				name: 'retireVersion',
				audience: 'question-author',
				permission: 'questions.publish'
			},
			{
				name: 'approveFutureLink',
				audience: 'question-author',
				permission: 'questions.review'
			},
			{
				name: 'retireFutureLink',
				audience: 'question-author',
				permission: 'questions.review'
			}
		]
	}
]);
