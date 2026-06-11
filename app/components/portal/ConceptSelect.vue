<script setup lang="ts">
import { ref, watch, type HTMLAttributes } from "vue";
import { Check, ChevronsUpDown, Search, X, ExternalLink } from "lucide-vue-next";
import { cn } from "~/lib/utils";

const apiEndpoint = useGetPrezAPIEndpoint();

const props = defineProps<{
    vocabIRI: string;
    placeholder?: string;
    multiple?: boolean;
    class?: HTMLAttributes["class"];
}>();

const model = defineModel<string | string[]>();

const open = ref(false);

type ConceptOption = {
	value: string;
	label?: string;
	desc?: string;
};

type SPARQLResultsJSON = {
	head: {
		vars?: string[];
		link?: string[];
	},
	results?: {
		bindings: Record<string, {
			type: "uri" | "literal" | "bnode";
			value: string;
			"xml:lang"?: string;
			datatype?: string;
		}>[];
	},
	boolean?: boolean;
};

async function sparqlSelect(url: string, query: string, signal?: AbortSignal): Promise<NonNullable<SPARQLResultsJSON["results"]>["bindings"]> {
	const r = await $fetch<SPARQLResultsJSON>(`${url}/sparql`, {
		query: {
			query: query,
		},
		signal: signal,
	});
	return r.results?.bindings || [];
}

async function sparqlOptions(url: string, vocabIRI: string): Promise<ConceptOption[]> {
	const results = await sparqlSelect(url, `
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        SELECT DISTINCT ?value ?label ?desc
        WHERE {
            BIND(<${vocabIRI}> AS ?cs)
            ?cs a skos:ConceptScheme .
            ?value a skos:Concept ;
                skos:inScheme ?cs ;
                skos:prefLabel ?label ;
                skos:definition ?desc .
        }`);
	const options: ConceptOption[] = results.map(result => {
		return {
			value: result.value.value,
			label: result.label.value,
			desc: result.desc.value,
		};
	});
	options.sort((a, b) => a.label.localeCompare(b.label));
	return options;
}

const { data: conceptOptions, status, error } = await useLazyAsyncData(props.vocabIRI, () => sparqlOptions(apiEndpoint, props.vocabIRI), {
	default: () => [],
});

const emits = defineEmits<{
    focus: [];
    blur: [];
    clear: [];
    input: [value: string | string[]];
    change: [value: string | string[]];
}>();

watch(open, (newValue) => {
    newValue ? emits("focus") : emits("blur");
});

watch(model, (newValue) => {
    emits("input", newValue);
    emits("change", newValue);
});
</script>

<template>
    <div class="flex flex-row gap-1 items-center w-full relative">
        <Combobox v-model="model" by="label" v-model:open="open" :multiple="props.multiple" class="relative w-full flex items-center">
            <ComboboxAnchor as-child>
                <ComboboxTrigger as-child>
                    <Button variant="outline" role="combobox" :aria-expanded="open" :class="cn(`grow justify-between !pr-10 ${(props.multiple && Array.isArray(model) ? model.length > 0 : model) ? '' : 'text-muted-foreground'}`, props.class)">
                        <span class="overflow-hidden">
                            {{ (props.multiple && Array.isArray(model) ? model.length > 0 : model) && conceptOptions
                            ? (Array.isArray(model)
                                ? model.map(v => conceptOptions.find((option) => option.value === v)?.label).join(", ")
                                : conceptOptions.find((option) => option.value === model)?.label)
                            : props.placeholder || "Select an option" }}
                        </span>
                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </ComboboxTrigger>
                <span class="absolute end-0 inset-y-0 flex items-center justify-center">
                    <Button size="icon" variant="link" class="text-muted-foreground hover:text-foreground" @click="model = props.multiple ? [] : ''"><X class="size-4" /></Button>
                </span>
            </ComboboxAnchor>

            <ComboboxList class="z-[100] w-[var(--reka-popper-anchor-width)]">
                <div class="relative w-full items-center">
                    <ComboboxInput class="focus-visible:ring-0 border-0 border-b rounded-none h-10" placeholder="Search..." />
                    <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                        <Search class="size-4 text-muted-foreground" />
                    </span>
                </div>

                <ComboboxEmpty>
                    No results found.
                </ComboboxEmpty>

                <ComboboxGroup class="max-h-[260px] overflow-y-auto">
                    <ComboboxItem v-for="option in conceptOptions" class="cursor-pointer" :key="option.value.toString()" :value="option.value">
                        <div class="flex flex-col">
                            <span>{{ option.label || option.value }}</span>
                            <span class="text-muted-foreground text-xs italic line-clamp-3">{{ option.desc }}</span>
                        </div>
                        <ComboboxItemIndicator>
                            <Check :class="cn('ml-auto h-4 w-4')" />
                        </ComboboxItemIndicator>
                    </ComboboxItem>
                </ComboboxGroup>
            </ComboboxList>
        </Combobox>
        <Button size="icon" variant="outline" title="Vocab page" as-child>
            <a :href="props.vocabIRI" target="_blank" rel="noopener noreferrer">
                <ExternalLink class="size-4" />
            </a>
        </Button>
    </div>
</template>