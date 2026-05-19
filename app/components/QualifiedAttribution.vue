<script setup lang="ts">
import type {HTMLAttributes} from "vue";
import type {PrezTerm} from "prez-lib";

const props = defineProps<{
	term: PrezTerm;
	variant?: 'item-table' | 'item-list' | 'item-header' | 'search-results' | 'item-profiles';
	renderHtml?: boolean;
	renderMarkdown?: boolean;
	class?: HTMLAttributes["class"];
}>();

const role = computed(() => {
	const predicate = props.term.properties['http://www.w3.org/ns/prov#hadRole'] || props.term.properties['http://www.w3.org/ns/dcat#hadRole'];
	return predicate.objects[0];
});

const agent = computed(() => {
	const predicate = props.term.properties['http://www.w3.org/ns/prov#agent'] || props.term.properties['https://schema.org/agent'];
	console.log(predicate.objects[0])
	return predicate.objects[0].properties['https://schema.org/name'].objects[0];
});
</script>

<template>
	<div class="flex flex-row items-center gap-1">
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
