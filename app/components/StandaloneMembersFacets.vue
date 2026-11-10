<script setup lang="ts">
import { X } from 'lucide-vue-next';
import type { PrezNode, PrezFacetValue } from 'prez-lib';
import type { FacetsProps } from 'prez-components';

const props = defineProps<FacetsProps & {
    filter: string;
}>();

const emit = defineEmits<{
    change: [filter: string];
}>();

const handleFacetValueClick = (facetName: PrezNode, facetValue: PrezFacetValue) => {
	const filterObj = JSON.parse((props.filter || '{}') as string);

	if (!filterObj.args) {
		filterObj.args = [];
	}
	filterObj.op = 'and';
	filterObj.args.push({
		op: '=',
		args: [
			{ property: facetName.value },
			facetValue.term.value
		]
	});

    emit("change", JSON.stringify(filterObj));
};

const computedProfile = computed(() => {
	// use the facet order in the profile, use this to order the facets, but return the facets in the order they are in the profile
	// if the facet is not found in the profile, add it to the end
	return props.facets.sort((a, b) => {
		const aIndex = props.profile.findIndex(p => p.node.value === a.facetName.value);
		const bIndex = props.profile.findIndex(p => p.node.value === b.facetName.value);

		// If neither facet is in profile, maintain original order
		if (aIndex === -1 && bIndex === -1) return 0;

		// If one facet isn't in profile, put it at the end
		if (aIndex === -1) return 1;
		if (bIndex === -1) return -1;

		// Both facets in profile, sort by index
		return aIndex - bIndex;
	});
});

function clearFilters() {
    emit("change", "");
}
</script>

<template>
	<div class="w-full">
		<div v-if="!props.facets || props.facets.length === 0" class="text-muted-foreground text-sm py-2"></div>
		<div v-else class="flex flex-wrap gap-2 items-center py-1">
			<StandaloneMembersFacet v-for="facet in computedProfile" :key="facet.facetName.value" :facet="facet" @change="(facetName, facetValue) => handleFacetValueClick(facetName, facetValue)" />
			<Button v-if="props.filter" variant="ghost" size="sm" class="text-muted-foreground" @click="clearFilters"><X class="size-4" /> Clear</Button>
		</div>
	</div>
</template>

<style scoped>

</style>
