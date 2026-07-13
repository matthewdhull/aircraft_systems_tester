import { AstSelectionV1Random } from './random.js';
import {
	SELECTION_ALGORITHM_VERSION,
	type CategoryAssignment,
	type MandatoryAssignment,
	type SelectionCandidate,
	type SelectionFailure,
	type SelectionInput,
	type SelectionResult,
	type SelectionRule,
	type SelectionShortage
} from './types.js';

type CanonicalCandidate = SelectionCandidate & {
	subtaskVersionIds: string[];
	elementVersionIds: string[];
};

const compareText = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0);
const uniqueSorted = (values: readonly string[]) => [...new Set(values)].sort(compareText);

function invalid(): SelectionFailure {
	return { ok: false, code: 'INVALID_SELECTION_INPUT', shortages: [] };
}

function canonicalCandidates(input: readonly SelectionCandidate[]): CanonicalCandidate[] | null {
	const byId = new Map<string, CanonicalCandidate>();
	for (const candidate of input) {
		if (!candidate.questionVersionId) return null;
		const normalized = {
			...candidate,
			subtaskVersionIds: uniqueSorted(candidate.subtaskVersionIds),
			elementVersionIds: uniqueSorted(candidate.elementVersionIds)
		};
		const existing = byId.get(candidate.questionVersionId);
		if (existing) {
			if (
				existing.eligible !== normalized.eligible ||
				existing.subtaskVersionIds.join('\0') !== normalized.subtaskVersionIds.join('\0') ||
				existing.elementVersionIds.join('\0') !== normalized.elementVersionIds.join('\0')
			)
				return null;
		} else byId.set(candidate.questionVersionId, normalized);
	}
	return [...byId.values()].sort((a, b) => compareText(a.questionVersionId, b.questionVersionId));
}

export function selectQuestions(input: SelectionInput): SelectionResult {
	if (input.algorithmVersion !== SELECTION_ALGORITHM_VERSION)
		return { ok: false, code: 'UNSUPPORTED_ALGORITHM', shortages: [] };
	if (input.seedBytes.length === 0) return invalid();

	const rules = [...input.rules].sort((a, b) => a.position - b.position || compareText(a.id, b.id));
	const mandatory = [...input.mandatoryElements].sort(
		(a, b) => a.position - b.position || compareText(a.elementVersionId, b.elementVersionId)
	);
	const candidates = canonicalCandidates(input.candidates);
	if (!candidates || !validStructure(rules, mandatory)) return invalid();

	const eligible = candidates.filter((candidate) => candidate.eligible);
	const shortages = directShortages(rules, mandatory, eligible);
	if (shortages.length > 0) return { ok: false, code: 'SELECTION_SHORTAGE', shortages };

	const random = new AstSelectionV1Random(input.seedBytes);
	const randomized = random.shuffle(eligible);
	const ruleBySubtask = new Map(rules.map((rule) => [rule.subtaskVersionId, rule]));
	const remaining = new Map(rules.map((rule) => [rule.id, rule.count]));
	const used = new Set<string>();
	const assignments: CategoryAssignment[] = [];
	const mandatoryAssignments: MandatoryAssignment[] = [];

	function assignMandatory(index: number): boolean {
		if (index === mandatory.length) return fillRules(0);
		const requirement = mandatory[index]!;
		const rule = ruleBySubtask.get(requirement.subtaskVersionId)!;
		for (const candidate of randomized) {
			if (
				used.has(candidate.questionVersionId) ||
				!candidate.elementVersionIds.includes(requirement.elementVersionId) ||
				!candidate.subtaskVersionIds.includes(requirement.subtaskVersionId) ||
				remaining.get(rule.id)! <= 0
			)
				continue;
			used.add(candidate.questionVersionId);
			remaining.set(rule.id, remaining.get(rule.id)! - 1);
			assignments.push({
				questionVersionId: candidate.questionVersionId,
				ruleId: rule.id,
				categoryPosition: rule.position
			});
			mandatoryAssignments.push({
				elementVersionId: requirement.elementVersionId,
				questionVersionId: candidate.questionVersionId
			});
			if (assignMandatory(index + 1)) return true;
			mandatoryAssignments.pop();
			assignments.pop();
			remaining.set(rule.id, remaining.get(rule.id)! + 1);
			used.delete(candidate.questionVersionId);
		}
		return false;
	}

	function fillRules(ruleIndex: number): boolean {
		if (ruleIndex === rules.length) return true;
		const rule = rules[ruleIndex]!;
		if (remaining.get(rule.id)! === 0) return fillRules(ruleIndex + 1);
		for (const candidate of randomized) {
			if (
				used.has(candidate.questionVersionId) ||
				!candidate.subtaskVersionIds.includes(rule.subtaskVersionId)
			)
				continue;
			used.add(candidate.questionVersionId);
			remaining.set(rule.id, remaining.get(rule.id)! - 1);
			assignments.push({
				questionVersionId: candidate.questionVersionId,
				ruleId: rule.id,
				categoryPosition: rule.position
			});
			if (fillRules(remaining.get(rule.id)! === 0 ? ruleIndex + 1 : ruleIndex)) return true;
			assignments.pop();
			remaining.set(rule.id, remaining.get(rule.id)! + 1);
			used.delete(candidate.questionVersionId);
		}
		return false;
	}

	if (!assignMandatory(0)) {
		const first = rules[0]!;
		return {
			ok: false,
			code: 'SELECTION_SHORTAGE',
			shortages: [
				{
					code: 'CATEGORY_SHORTAGE',
					ruleId: first.id,
					subtaskVersionId: first.subtaskVersionId,
					needed: first.count,
					available: Math.max(0, first.count - 1)
				}
			]
		};
	}

	assignments.sort(
		(a, b) =>
			a.categoryPosition - b.categoryPosition ||
			compareText(a.questionVersionId, b.questionVersionId)
	);
	mandatoryAssignments.sort((a, b) => compareText(a.elementVersionId, b.elementVersionId));
	return {
		ok: true,
		algorithmVersion: SELECTION_ALGORITHM_VERSION,
		assignments,
		mandatoryAssignments
	};
}

function validStructure(
	rules: readonly SelectionRule[],
	mandatory: SelectionInput['mandatoryElements']
): boolean {
	if (rules.length === 0 || new Set(rules.map((rule) => rule.id)).size !== rules.length)
		return false;
	if (new Set(rules.map((rule) => rule.subtaskVersionId)).size !== rules.length) return false;
	if (
		rules.some(
			(rule, index) =>
				!rule.id ||
				!rule.subtaskVersionId ||
				rule.position !== index + 1 ||
				!Number.isSafeInteger(rule.count) ||
				rule.count <= 0
		)
	)
		return false;
	if (new Set(mandatory.map((item) => item.elementVersionId)).size !== mandatory.length)
		return false;
	if (
		mandatory.some(
			(item, index) =>
				!item.elementVersionId ||
				item.position !== index + 1 ||
				!rules.some((rule) => rule.subtaskVersionId === item.subtaskVersionId)
		)
	)
		return false;
	return rules.every(
		(rule) =>
			mandatory.filter((item) => item.subtaskVersionId === rule.subtaskVersionId).length <=
			rule.count
	);
}

function directShortages(
	rules: readonly SelectionRule[],
	mandatory: SelectionInput['mandatoryElements'],
	candidates: readonly CanonicalCandidate[]
): SelectionShortage[] {
	const result: SelectionShortage[] = [];
	for (const requirement of mandatory) {
		const available = candidates.filter(
			(candidate) =>
				candidate.subtaskVersionIds.includes(requirement.subtaskVersionId) &&
				candidate.elementVersionIds.includes(requirement.elementVersionId)
		).length;
		if (available < 1)
			result.push({
				code: 'MANDATORY_ELEMENT_SHORTAGE',
				elementVersionId: requirement.elementVersionId,
				subtaskVersionId: requirement.subtaskVersionId,
				needed: 1,
				available
			});
	}
	for (const rule of rules) {
		const available = candidates.filter((candidate) =>
			candidate.subtaskVersionIds.includes(rule.subtaskVersionId)
		).length;
		if (available < rule.count)
			result.push({
				code: 'CATEGORY_SHORTAGE',
				ruleId: rule.id,
				subtaskVersionId: rule.subtaskVersionId,
				needed: rule.count,
				available
			});
	}
	return result;
}
