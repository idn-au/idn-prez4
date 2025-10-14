<script lang="ts" setup>
import { type HTMLAttributes } from "vue";
import { OlZoomToExtentControl } from "vue3-openlayers/controls";
import { ChevronRight, Locate } from "lucide-vue-next";
import { cn } from "~/lib/utils";

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

type SearchResult = {
    iri: string;
    label: string;
    geom: string;
    fc: string;
    fcLabel: string;
    d: string;
    dLabel: string;
};

const props = defineProps<{
    class?: HTMLAttributes["class"];
}>();

const PER_PAGE = 10;
const LIMIT = 100;

const runtimeConfig = useRuntimeConfig();

const searchResults = ref<SearchResult[]>([]);
const loading = ref(false);
const pageNumber = ref(1);

const baseMapRef = useTemplateRef("baseMapRef");

const features = computed(() => {
    return {
        "type": "FeatureCollection",
        "title": "Search",
        "features": searchResults.value.map(f => {
            return {
                type: "Feature",
                wkt: f.geom,
                properties: {
                    iri: f.iri,
                    name: f.label,
                    fc: f.fc,
                    fcLabel: f.fcLabel,
                    d: f.d,
                    dLabel: f.dLabel,
                },
                id: f.iri,
            }
        }),
    }
});

const paginatedResults = computed(() => {
    const start = (pageNumber.value - 1) * PER_PAGE;
    const end = (pageNumber.value * PER_PAGE) - 1;
    if (searchResults.value.length > PER_PAGE) {
        return searchResults.value.slice(start, end);
    } else if (searchResults.value.length > 0) {
        return searchResults.value;
    } else return [];
});

let abortController = new AbortController();

const drawnGeometry = ref<{ geoJSON: string; wkt: string; } | undefined>(undefined);

async function searchWithin(geometry: { geoJSON: string; wkt: string; }) {
    drawnGeometry.value = geometry;
    pageNumber.value = 1;
    if (loading.value) {
        abortController.abort();
    }
    abortController = new AbortController();
    loading.value = true;
    searchResults.value = [];

    const query = `PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sdo: <https://schema.org/>

SELECT DISTINCT ?f ?label ?geom ?fc ?fcLabel ?d ?dLabel
WHERE {
	VALUES ?d { ${(selectedDatasets.value.length > 0 && selectedDatasets.value.length < datasetOptions.value.length) ? selectedDatasets.value.map(d => `<${d}>`).join(' ') : 'UNDEF'} }
	?f ^rdfs:member ?fc ;
		geo:hasGeometry/geo:asWKT ?geom ;
  	 	sdo:name|dcterms:title|rdfs:label ?label .
  	?fc ^rdfs:member ?d ;
        sdo:name|dcterms:title|rdfs:label ?fcLabel .
  	?d sdo:name|dcterms:title|rdfs:label ?dLabel .
  	
	FILTER geof:sfWithin(?geom, "<http://www.opengis.net/def/crs/OGC/1.3/CRS84> ${geometry.wkt}"^^geo:wktLiteral)
} LIMIT ${LIMIT}`;
    const r = await $fetch<SPARQLResultsJSON>(`${runtimeConfig.public.prezApiEndpoint}/sparql`, {
        params: {
            query: query,
        },
        headers: {
            "Content-Type": "application/sparql-query",
        },
        signal: abortController.signal,
    });
    searchResults.value = r.results?.bindings.map(r => ({
        iri: r.f.value,
        label: r.label.value,
        geom: r.geom.value,
        fc: r.fc.value,
        fcLabel: r.fcLabel.value,
        d: r.d.value,
        dLabel: r.dLabel.value,
    })).sort((a, b) => a.label.localeCompare(b.label)) || [];
    loading.value = false;
}

const { data: datasets, status: datasetStatus } = await useLazyAsyncData(() => $fetch<SPARQLResultsJSON>(`${runtimeConfig.public.prezApiEndpoint}/sparql`, {
    params: {
        query: `PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sdo: <https://schema.org/>
SELECT ?iri ?label
WHERE {
    VALUES ?labelPredicate { sdo:name dcterms:title rdfs:label }
    ?iri a dcat:Dataset ;
        ?labelPredicate ?label .
} ORDER BY ?label`,
    },
    headers: {
        "Content-Type": "application/sparql-query",
    },
}));

const datasetOptions = computed(() => datasets.value?.results?.bindings.map(r => ({label: r.label.value, value: r.iri.value})) || []);

const selectedDatasets = ref<string[]>([]);

function handleCheck(iri: string) {
    const index = selectedDatasets.value.indexOf(iri);
    if (index >= 0) {
        selectedDatasets.value.splice(index, 1);
    } else {
        selectedDatasets.value.push(iri);
    }

    if (!!drawnGeometry.value) {
        searchWithin(drawnGeometry.value);
    }
}
</script>

<template>
    <div :class="cn('', props.class)">
        <!-- <div class="grid grid-cols-[1fr_3fr] gap-4">
            <div class="flex flex-col border rounded-md gap-2 p-3">
                <span>Filter by dataset:</span>
                <div class="flex flex-col gap-1 text-sm">
                    <template v-if="datasetStatus === 'pending'">
                        <Skeleton v-for="_ in 5" class="h-6 w-42" />
                    </template>
                    <template v-else-if="datasetStatus === 'success'">
                        <div v-for="dataset in datasetOptions" class="">
                            <Checkbox :id="dataset.value" :value="dataset.value" @update:checked="() => handleCheck(dataset.value)" :modelValue="selectedDatasets.includes(dataset.value)" />
                            <label :for="dataset.value">{{ dataset.label }}</label>
                        </div>
                    </template>
                </div>
            </div>
            <MapTemp
                ref="baseMapRef"
                class="h-[500px]"
                :layers="[features]"
                fitAddedLayersToExtent
                :animationDuration="1000"
                enableToolbar
                enableDrawing
                enableClearFeatures
                clearDrawingsOnLayerChange
                :loading="loading"
                @drawend="searchWithin"
                @clearDrawing="drawnGeometry = undefined"
            >
                <template #controls>
                    <OlZoomToExtentControl :extent="[94.40010000000001, -47.24705625, 173.1501, -3.30174375]" label="^" tipLabel="Reset zoom" />
                </template>
            </MapTemp>
        </div> -->
        <div class="flex flex-col gap-4">
            <Accordion type="single" collapsible class="border rounded-md">
                <AccordionItem value="filter" class="border-0">
                    <AccordionTrigger class="p-3">Filter by dataset</AccordionTrigger>
                    <AccordionContent class="p-3 border-t">
                        <div class="flex flex-col gap-1 text-sm">
                            <template v-if="datasetStatus === 'pending'">
                                <Skeleton v-for="_ in 5" class="h-6 w-42" />
                            </template>
                            <template v-else-if="datasetStatus === 'success'">
                                <div v-for="dataset in datasetOptions" class="">
                                    <Checkbox :id="dataset.value" :value="dataset.value" @update:checked="() => handleCheck(dataset.value)" :modelValue="selectedDatasets.includes(dataset.value)" />
                                    <label :for="dataset.value">{{ dataset.label }}</label>
                                </div>
                            </template>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <MapTemp
                ref="baseMapRef"
                class="h-[500px]"
                :layers="[features]"
                fitAddedLayersToExtent
                :animationDuration="1000"
                enableToolbar
                enableDrawing
                enableClearFeatures
                clearDrawingsOnLayerChange
                :loading="loading"
                @drawend="searchWithin"
                @clearDrawing="drawnGeometry = undefined"
            >
                <template #controls>
                    <OlZoomToExtentControl :extent="[94.40010000000001, -47.24705625, 173.1501, -3.30174375]" label="^" tipLabel="Reset zoom" />
                </template>
            </MapTemp>
        </div>
        <div class="flex flex-col my-4">
            <div v-for="result in paginatedResults" class="flex flex-col p-2 even:bg-muted/50" :key="result.iri">
                <div class="flex flex-row items-start justify-between">
                    <div class="flex flex-row gap-2 items-center">
                        <NuxtLink :to="`/object?uri=${result.iri}`" class="font-bold">{{ result.label }}</NuxtLink>
                    </div>
                    <div class="flex flex-row gap-2 items-center">
                        <Button variant="outline" size="icon" title="Select feature on map" @click="baseMapRef?.selectFeatureByIRI(result.iri, false)"><Locate /></Button>
                    </div>
                </div>
                <div class="flex flex-row items-center gap-2 !text-muted-foreground text-xs">
                    <NuxtLink :to="`/object?uri=${result.d}`">{{ result.dLabel }}</NuxtLink>
                    <ChevronRight class="size-4" />
                    <NuxtLink :to="`/object?uri=${result.fc}`">{{ result.fcLabel }}</NuxtLink>
                    <ChevronRight class="size-4" />
                    <NuxtLink :to="`/object?uri=${result.iri}`" class="font-bold">{{ result.label }}</NuxtLink>
                </div>
            </div>
        </div>
        <template v-if="searchResults.length > 0">
            <Pagination v-model:page="pageNumber" :total="searchResults.length" :itemsPerPage="PER_PAGE" showEdges :siblingCount="1" v-slot="{ page }">
                <PaginationList v-slot="{ items }" class="flex items-center gap-1 justify-center">
                    <PaginationFirst></PaginationFirst>
                    <PaginationPrev></PaginationPrev>
                    <template v-for="(item, index) in items">
                        <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
                            <Button class="w-10 h-10 p-0" :variant="item.value === page ? 'default' : 'outline'" @click="pageNumber = item.value">{{ item.value }}</Button>
                        </PaginationListItem>
                        <PaginationEllipsis v-else :key="item.type" :index="index" />
                    </template>
                    <PaginationNext></PaginationNext>
                    <PaginationLast></PaginationLast>
                </PaginationList>
            </Pagination>
            <div class="text-sm text-muted-foreground text-center mt-2">
                Showing {{ (pageNumber - 1) * PER_PAGE + 1 }} to 
                {{ Math.min(pageNumber * PER_PAGE, searchResults.length) }} of {{ searchResults.length }} items
            </div>
        </template>
    </div>
</template>
