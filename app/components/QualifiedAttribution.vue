<script setup lang="ts">
import type {HTMLAttributes} from "vue";
import type {PrezTerm, PrezProperty, PrezBlankNode, PrezNode} from "prez-lib";

const props = defineProps<{
	term: PrezTerm;
	variant?: "item-table" | "item-list" | "item-header" | "search-results" | "item-profiles";
	renderHtml?: boolean;
	renderMarkdown?: boolean;
	class?: HTMLAttributes["class"];
}>();

const rolePredicates = [
	"https://schema.org/roleName",
	"http://www.w3.org/ns/prov#hadRole",
	"http://www.w3.org/ns/dcat#hadRole",
];
const agentPredicates = [
	"https://schema.org/agent",
	"http://www.w3.org/ns/prov#agent",
];

const role = computed(() => {
	const predicateIri = rolePredicates.find(p => p in props.term.properties);
	const predicate: PrezProperty = predicateIri ? props.term.properties[predicateIri] : undefined;
	if (predicate && predicate.objects.length > 0) {
		return predicate.objects[0] as PrezNode;
	} else return undefined;
});

const agent = computed(() => {
	const predicateIri = agentPredicates.find(p => p in props.term.properties);
	const predicate: PrezProperty = predicateIri ? props.term.properties[predicateIri] : undefined;
	if (predicate && predicate.objects.length > 0) {
		const object = predicate.objects[0]!;
		if (object.termType === "BlankNode") {
			return 'https://schema.org/name' in (object as PrezBlankNode).properties && (object as PrezBlankNode).properties['https://schema.org/name']!.objects.length > 0
				? (object as PrezBlankNode).properties['https://schema.org/name']!.objects[0]
				: "";
		} else {
			return object;
		}
	} else return undefined;
});
</script>

<template>
	<div v-if="role && agent" class="flex flex-row items-center gap-1">
		<Term
			:term="role"
			:variant="props.variant"
			:renderHtml="props.renderHtml"
			:renderMarkdown="props.renderMarkdown"
		/>
		-
		<Term
			:term="agent"
			:variant="props.variant"
			:renderHtml="props.renderHtml"
			:renderMarkdown="props.renderMarkdown"
		/>
	</div>
</template>
