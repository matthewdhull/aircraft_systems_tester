import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');

async function signIn(
	page: import('@playwright/test').Page,
	employeeNumber: string
): Promise<void> {
	await page.goto('/login');
	await page.getByLabel('Employee number').fill(employeeNumber);
	await page.getByLabel('Password').fill(process.env.PHASE7_E2E_PASSWORD!);
	// Chrome's headless form navigation reports a null Origin; submit the same
	// fields through the context request so origin protection remains enabled.
	const response = await page.request.post('/login', {
		headers: { origin: process.env.PLAYWRIGHT_BASE_URL! },
		form: { next: '/', employeeNumber, password: process.env.PHASE7_E2E_PASSWORD! },
		maxRedirects: 0
	});
	expect(response.status()).toBe(200);
	await page.goto('/');
}

test('assigned instructor generates once, previews safely, and cannot recover the raw code', async ({
	page
}) => {
	await signIn(page, 'P7ASSIGNED');
	await page.goto('/generated-tests');
	await page.getByLabel('Template').selectOption({ index: 1 });
	await page.getByLabel('Assigned roster').selectOption({ index: 1 });
	const generation = await page.request.post('/generated-tests?/generate', {
		headers: { origin: process.env.PLAYWRIGHT_BASE_URL! },
		form: {
			templateVersionId: '70000000-0000-4000-8000-000000000031',
			classRosterId: '70000000-0000-4000-8000-000000000015'
		}
	});
	expect(generation.status()).toBe(200);
	expect(generation.headers()['cache-control']).toContain('no-store');
	const oneTimeBody = await generation.text();
	const rawCode = oneTimeBody.match(/[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/)?.[0];
	expect(rawCode).toBeTruthy();
	await page.goto('/generated-tests');
	await page.reload();
	await expect(page.locator('#access-code')).toHaveCount(0);
	await expect(page.locator('body')).not.toContainText(rawCode!);
	await page
		.getByRole('link', { name: /Synthetic Phase 7 Five-Item Test/ })
		.first()
		.click();
	await expect(page.getByText('ast-selection-v1')).toBeVisible();
	await page.getByRole('link', { name: /Staff preview/ }).click();
	await expect(page.getByText(/Staff preview — no attempt is created/)).toBeVisible();
	await page.addScriptTag({ path: axePath });
	const violations = await page.evaluate(async () => {
		const result = await (
			window as unknown as { axe: { run(): Promise<{ violations: unknown[] }> } }
		).axe.run();
		return result.violations;
	});
	expect(violations).toEqual([]);
});

test('unassigned instructor is denied the assigned roster independently of UI visibility', async ({
	page
}) => {
	await signIn(page, 'P7UNASSIGNED');
	await page.goto('/generated-tests');
	await expect(page.getByLabel('Assigned roster').locator('option')).toHaveCount(1);
	const response = await page.request.post('/generated-tests?/generate', {
		headers: { origin: process.env.PLAYWRIGHT_BASE_URL! },
		form: {
			templateVersionId: '70000000-0000-4000-8000-000000000031',
			classRosterId: '70000000-0000-4000-8000-000000000015'
		}
	});
	expect(response.status()).toBe(200);
	expect(await response.json()).toMatchObject({ type: 'failure', status: 403 });
});
