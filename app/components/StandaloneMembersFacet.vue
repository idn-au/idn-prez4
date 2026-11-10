<script setup lang="ts">
import { ChevronDown, X, ListFilter, Funnel } from 'lucide-vue-next';
import type { PrezNode, PrezTerm, PrezFacetValue, PrezFacet } from 'prez-lib';

const props = defineProps<{
    facet: PrezFacet;
}>();

const emit = defineEmits<{
    change: [facetName: PrezNode, facetValue: PrezFacetValue];
}>();

const q = ref("");

const filteredValues = computed(() => {
    return props.facet.facetValues
        .filter(v => !v.term.value.startsWith("https://olis.dev/") && getTermDisplay(v.term).toLowerCase().includes(q.value.toLowerCase()))
        .sort((a, b) => {
    		if (a.count === b.count) {
    			return sortNodesByLabel(a.term, b.term);
    		} else {
    			return b.count - a.count;
    		}
    	});
});

function getTermDisplay(term: PrezTerm): string {
	return (term.termType === 'NamedNode' ? term.label?.value : undefined) || term.value;
};

function handleFacetValueClick(facetName: PrezNode, facetValue: PrezFacetValue) {
    emit("change", facetName, facetValue);
};
</script>

<template>
    <DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Button variant="outline" size="sm" class="inline-flex items-center">
			    <Funnel class="size-4 text-muted-foreground" />
				{{getTermDisplay(props.facet.facetName)}}
				<ChevronDown class="ml-1 size-4 text-muted-foreground" aria-hidden="true" />
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent class="w-56 max-h-60 overflow-y-auto">
    		<InputGroup class="h-8 mb-2">
    			<InputGroupAddon>
    				<ListFilter class="size-4" />
    			</InputGroupAddon>
    			<InputGroupInput v-model="q" placeholder="Filter..." class="text-sm" />
    			<InputGroupAddon align="inline-end">
    				<InputGroupButton type="button" size="icon-sm" variant="link" class="text-muted-foreground hover:text-foreground" @click="q = ''">
    					<X class="size-4" />
    				</InputGroupButton>
    			</InputGroupAddon>
    		</InputGroup>
			<template v-if="props.facet.facetValues.length > 0">
				<DropdownMenuItem
					v-for="value in filteredValues"
					:key="value.term.value"
					:inset="false"
					class="flex justify-between items-center cursor-pointer"
					:title="getTermDisplay(value.term)"
					@click="handleFacetValueClick(props.facet.facetName, value)"
				>
                    <span class="truncate pr-2">
                        {{getTermDisplay(value.term)}}
                    </span>
					<span class="text-muted-foreground bg-muted rounded-full px-1.5 py-0 text-xs font-medium ml-2 shrink-0">
                        {{ value.count }}
                    </span>
				</DropdownMenuItem>
			</template>
			<DropdownMenuItem v-else disabled>
				<span class="text-muted-foreground italic">No values</span>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</template>

<style scoped>

</style>
