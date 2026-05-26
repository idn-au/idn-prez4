<script setup lang="ts">
import type {HTMLAttributes} from "vue";
import type {PrezTerm, PrezProperty, PrezBlankNode} from "prez-lib";

const props = defineProps<{
	term: PrezTerm;
	variant?: 'item-table' | 'item-list' | 'item-header' | 'search-results' | 'item-profiles';
	renderHtml?: boolean;
	renderMarkdown?: boolean;
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
	<Badge variant="secondary">
		<Term :term="props.term" />
	</Badge>
</template>
