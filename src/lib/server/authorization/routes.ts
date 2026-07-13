import type { PermissionCode } from './policy.js';

export type RouteAudience = 'public' | 'authenticated' | 'instructor-capable' | 'administrator';

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
	}
]);
