<script setup lang="ts">
import {X, ArrowDownUp, ArrowDownAZ, ArrowUpAZ, Filter, Search, SearchSlash, CircleAlert, Timer, Pentagon} from "lucide-vue-next";
import {sparqlQuery} from "~/utils/helpers";
import Map from "./Map.vue";
import AdvancedSearchForm from "./AdvancedSearchForm.vue";
import SearchResult from "~/components/portal/SearchResult.vue";
import PageLimitSelect from "~/components/portal/PageLimitSelect.vue";
import SearchPagination from "~/components/portal/SearchPagination.vue";

const apiEndpoint = useGetPrezAPIEndpoint();

const sortFields = [
	"relevance",
	"title",
	"date",
];

const formData = ref({
	q: "",
	additionalType: [],
	keywords: [],
	language: [],
	accessRights: [],
	from: "",
	to: "",
	location: "",
	parent: [],
	type: [],
	within: "",
});
const sortBy = ref("");
const sortDir = ref("asc");
const page = ref(1);
const perPage = ref(10);
const showFilters = ref(false);
const responseTime = ref(0);

const map = useTemplateRef("map");

const searchKey = computed(() => `${JSON.stringify(formData.value)}-${page.value}-${perPage.value}`);

const innerQuery = computed(() => `${formData.value.q ? `(?iri ?score) text:query (sdo:name skos:prefLabel skos:altLabel "${formData.value.q}") .` : ""}
${formData.value.type.length > 0 ? `VALUES ?_type {${formData.value.type.map(t => `<${t}>`).join(" ")}}
?iri a ?_type .` : ""}
${formData.value.additionalType.length > 0 ? `VALUES ?_additionalType {${formData.value.additionalType.map(t => `<${t}>`).join(" ")}}
?iri sdo:additionalType ?_additionalType .` : ""}
${formData.value.keywords.length > 0 ? `VALUES ?_keyword {${formData.value.keywords.map(k => `<${k}>`).join(" ")}}
?iri sdo:keywords ?_keyword .` : ""}
${formData.value.language.length > 0 ? `VALUES ?_lang {${formData.value.language.map(k => `<${k}>`).join(" ")}}
?iri sdo:inLanguage ?_lang .` : ""}
${formData.value.accessRights.length > 0 ? `VALUES ?_rights {${formData.value.accessRights.map(k => `<${k}>`).join(" ")}}
?iri sdo:usageInfo ?_rights .` : ""}
${formData.value.within ? `?iri geo:hasGeometry/geo:asWKT ?geom .
FILTER geof:sfWithin(?geom, "<http://www.opengis.net/def/crs/OGC/1.3/CRS84> ${formData.value.within}"^^geo:wktLiteral) .` : ""}
FILTER(!ISBLANK(?iri))`);

const countQuery = computed(() => `PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
PREFIX sdo: <https://schema.org/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX text: <http://jena.apache.org/text#>
SELECT (COUNT(?iri) AS ?count)
WHERE {
    {
    	SELECT DISTINCT ?iri
    	WHERE {
    		${innerQuery.value}
    	} LIMIT 1000
    }
}`);

const labelPredicates = "sdo:name|skos:prefLabel";
const descPredicates = "sdo:description|skos:definition";

const listQuery = computed(() => `PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
PREFIX sdo: <https://schema.org/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX text: <http://jena.apache.org/text#>
SELECT DISTINCT ?iri (GROUP_CONCAT(DISTINCT ?_type1; separator=",") AS ?type) ${formData.value.q ? "?score" : ""} (GROUP_CONCAT(?_label; separator="|") AS ?label) (GROUP_CONCAT(?_description; separator="|") AS ?description) (GROUP_CONCAT(DISTINCT ?_addType; separator=",") AS ?addType) (GROUP_CONCAT(DISTINCT ?_keywords; separator=",") AS ?keywords) ?created (GROUP_CONCAT(DISTINCT ?_accessRights; separator=",") AS ?accessRights) (GROUP_CONCAT(DISTINCT ?_url; separator="|") AS ?url) ?geom
WHERE {
	{
		SELECT DISTINCT ?iri ${formData.value.q ? "?score" : ""}
		WHERE {
  			${innerQuery.value}
  		}
  		${formData.value.q ? "ORDER BY DESC(?score)" : ""}
		LIMIT ${perPage.value}
  		OFFSET ${(page.value - 1) * perPage.value}
    }
	?iri a ?t ;
		${labelPredicates} ?_label .
	OPTIONAL {
		?t ${labelPredicates} ?typeLabel .
	}
	BIND (COALESCE(?typeLabel, ?t) AS ?_type1)
	OPTIONAL {
		?iri ${descPredicates} ?_description .
	}
	OPTIONAL {
		?iri sdo:additionalType ?aType .
		OPTIONAL {
			?aType ${labelPredicates} ?aTypeLabel .
		}
		BIND (COALESCE(?aTypeLabel, ?aType) AS ?_addType)
	}
	OPTIONAL {
		{
			?iri sdo:keywords ?key .
			OPTIONAL {
				?key ${labelPredicates} ?keywordLabel .
			}
			BIND (COALESCE(?keywordLabel, ?key) AS ?_keywords)
			FILTER(ISIRI(?key))
		} UNION { # for literals
			?iri sdo:keywords ?_keywords .
			FILTER(ISLITERAL(?_keywords))
		}
	}
	OPTIONAL {
		?iri sdo:dateCreated ?created .
	}
	OPTIONAL {
		{
			?iri sdo:usageInfo ?use .
			OPTIONAL {
				?use ${labelPredicates} ?useLabel .
			}
			BIND (COALESCE(?useLabel, ?use) AS ?_accessRights)
			FILTER(ISIRI(?use))
		} UNION { # for literals
			?iri sdo:usageInfo ?_accessRights .
			FILTER(ISLITERAL(?_accessRights))
		}
	}
	OPTIONAL {
		?iri sdo:url ?_url .
	}
	OPTIONAL {
		?iri geo:hasGeometry/geo:asWKT ?geom .
	}
}
GROUP BY ?iri ${formData.value.q ? "?score" : ""} ?created ?geom
ORDER BY ${formData.value.q ? "DESC(?score)" : ""} STR(?label)`);

async function doSearch(): Promise<{count: number; results: Result[]}> {
	const start = new Date().getTime();
	const [r, c] = await Promise.all([sparqlQuery(`${apiEndpoint}/sparql`, listQuery.value), sparqlQuery(`${apiEndpoint}/sparql`, countQuery.value)]);
	const end = new Date().getTime();
	responseTime.value = end - start;
	const count = Number(c[0]?.count) || 0;
	const results: Result[] = r.map(i => ({
		...i,
		label: i.label.split("|")[0],
		description: i.description?.split("|")[0],
		type: i.type.split(",").map(a => a.trim()).sort((a, b) => a.localeCompare(b)),
		addType: i.addType?.split(",").map(a => a.trim()).sort((a, b) => a.localeCompare(b)),
		keywords: i.keywords?.split(",").map(a => a.trim()).sort((a, b) => a.localeCompare(b)),
		accessRights: i.accessRights?.split(",").map(a => a.trim()).sort((a, b) => a.localeCompare(b)),
		url: i.url?.split("|")[0],
	}));
	return {
		count,
		results,
	};
}

const { data, status, error, refresh } = await useLazyAsyncData(searchKey.value, () => doSearch(), {
	default: () => ({
		count: 0,
		results: [] as Result[],
	}),
	immediate: false,
	watch: [page, perPage],
});

const features = computed(() => {
	return {
		"type": "FeatureCollection",
		"title": "Search",
		"features": data.value.results.filter(r => r.geom).map(f => {
			return {
				type: "Feature",
				wkt: f.geom,
				properties: {
					iri: f.iri,
					name: f.label,
				},
				id: f.iri,
			}
		}),
	}
});

function changeSort(key: string) {
	if (key === sortBy.value) {
		sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
	} else {
		sortBy.value = key;
		sortDir.value = "asc";
	}
}

function handleResultMapFocus(iri: string) {
	map.value?.selectFeatureByIRI(iri, false);
}
</script>

<template>
	<div>
		<h2 class="text-2xl my-4">IDN Search Portal</h2>
		<p class="mb-4">
			Search via the search field below. More fields are available to filter by in the advanced search form. You can also search within an area by drawing a polygon on the map below by selecting the <Pentagon class="inline size-4" /> button.
		</p>
		<AdvancedSearchForm v-model="formData" @submit="refresh" />
		<div class="flex flex-row items-end gap-2 bg-background">
<!--			<Button :variant="showFilters ? 'secondary' : 'ghost'" @click="showFilters = !showFilters">-->
<!--				<Filter />-->
<!--				Filters-->
<!--			</Button>-->
<!--			<Button v-for="field in sortFields" :variant="sortBy === field ? 'secondary' : 'outline'" :class="sortBy === field ? '' : 'text-muted-foreground'" @click="changeSort(field)">-->
<!--				<template v-if="sortBy === field">-->
<!--					<ArrowDownAZ v-if="sortDir === 'asc'" />-->
<!--					<ArrowUpAZ v-else />-->
<!--				</template>-->
<!--				<ArrowDownUp v-else class="text-muted-foreground" />-->
<!--				{{field}}-->
<!--			</Button>-->
<!--			<Button v-if="sortBy !== ''" variant="outline" @click="sortBy = ''; sortDir = 'asc'"><X /> Clear sort</Button>-->
			<PageLimitSelect v-model="perPage" />
		</div>
		<div v-if="data.count > 0">
			<SearchPagination :totalItems="data.count" v-model:page="page" v-model:limit="perPage" />
		</div>
		<div class="flex flex-row gap-4">
<!--			<div :class="`overflow-hidden transition-[width] sticky top-[calc(52px+36px)] ${showFilters ? 'w-1/4' : 'w-0'}`">-->
<!--				filters-->
<!--			</div>-->
			<div class="flex-1 flex flex-col gap-4">
				<div class="flex flex-row items-center gap-2">
					<h3 class="text-lg">Results</h3>
					<span v-if="status === 'success'">({{data.count}})</span>
					<span v-if="status === 'success'" class="text-sm text-muted-foreground flex flex-row items-center gap-1"><Timer class="size-3.5" /> {{responseTime / 1000}}s</span>
				</div>
<!--				<pre class="whitespace-pre-wrap">{{data}}</pre>-->
				<Alert v-if="error" variant="destructive" class="border-destructive">
					<CircleAlert />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>Something went wrong while searching</AlertDescription>
				</Alert>
				<Empty v-else-if="status === 'idle'" class="flex-[unset] self-stretch">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Search />
						</EmptyMedia>
						<EmptyTitle>No Results Yet</EmptyTitle>
						<EmptyDescription>
							You haven't searched for anything yet. Use the search form above or filter by drawing on the map.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
				<template v-else-if="status === 'pending'">
					<SearchResult v-for="_ in 3" loading />
				</template>
				<Empty v-else-if="status === 'success' && data.count === 0" class="flex-[unset] self-stretch">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<SearchSlash />
						</EmptyMedia>
						<EmptyTitle>No Results Found</EmptyTitle>
						<EmptyDescription>
							Your query didn't find any results. Try a different search query.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
				<template v-else-if="status === 'success' && data.count > 0">
					<SearchResult v-for="result in data.results" v-bind="result" @mapFocus="handleResultMapFocus" />
				</template>
			</div>
			<div class="sticky top-[calc(52px+36px)] flex-1">
				<Map v-model="formData.within" :features="features" :loading="status === 'pending'" ref="map" />
			</div>
		</div>
		<div v-if="data.count > 0">
			<SearchPagination :totalItems="data.count" v-model:page="page" v-model:limit="perPage" />
		</div>
	</div>
</template>

<style scoped>

</style>