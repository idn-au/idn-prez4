<script lang="ts" setup>
import { ChevronDown, ChevronRight } from "lucide-vue-next";
import {
	applyProfileToItem,
	dumpNodeArray,
	getTopConceptsUrl,
	SYSTEM_PREDICATES,
	type PrezConceptSchemeNode,
	type PrezDataItem,
	type PrezNode,
	type PrezBBlockNode, type PrezOntologyNode
} from 'prez-lib';
import { DependencyViewer, ProvenanceDiagram } from "prez-components";

const appConfig = useAppConfig();
const { globalProfiles } = useGlobalProfiles();
const router = useRouter();
const route = useRoute();
const { getPageUrl } = usePageInfo();
const urlPath = ref(getPageUrl());
const apiEndpoint = useGetPrezAPIEndpoint();
const { status, error, data } = useGetItem(apiEndpoint, urlPath);
const isConceptScheme = computed(() => data.value?.data.rdfTypes?.find(n => n.value == SYSTEM_PREDICATES.skosConceptScheme));
const isOntology = computed(()=> data.value?.data.rdfTypes?.find(n=>n.value == SYSTEM_PREDICATES.owlOntology));
const isBBlock = computed(()=> {
	if (data.value?.data) {
		const prezBBlockNode: PrezBBlockNode = { dependsOn: [], isBBlock: false, ...data.value?.data };//this little hack is necessary for TypeScript
		return prezBBlockNode.isBBlock;
	}
	return false;
});
const topConceptsUrl = computed(() => isConceptScheme.value ? getTopConceptsUrl(data.value!.data) : "");
const apiUrl = (apiEndpoint + urlPath.value).split("?")[0];
const currentProfile = computed(() => data.value ? data.value.profiles.find(p => p.current) : undefined);
const resourceUri = computed(()=>data.value ? data.value.data.value : undefined);
const resourceLabel = computed(()=>data.value?.data.label ? data.value.data.label.value : undefined);
const provenance = ref(await getProvenance(resourceUri.value, resourceLabel.value, apiEndpoint));

const nonMemberTypes = [
    "http://www.w3.org/2004/02/skos/core#ConceptScheme",
    "http://www.w3.org/2004/02/skos/core#Concept",
    "https://schema.org/CreativeWork",
    "http://www.w3.org/ns/dcat#Resource",
    "http://www.opengis.net/ont/geosparql#Feature",
];

const geomPredicates = [
    "http://www.opengis.net/ont/geosparql#hasGeometry",
    "http://www.opengis.net/ont/geosparql#hasBoundingBox",
];

const SCHEMA_CREATIVE_WORK = "https://schema.org/CreativeWork";
const SCHEMA_SPATIAL_COVERAGE = "https://schema.org/spatialCoverage";
const SCHEMA_NAME = "https://schema.org/name";
const GEO_AS_WKT = "http://www.opengis.net/ont/geosparql#asWKT";

const isCreativeWork = computed(() =>
    data.value?.data.rdfTypes?.some(type => type.value === SCHEMA_CREATIVE_WORK),
);

function termProperties(term: any) {
    return {
        ...(data.value?.store.getProperties(term) || {}),
        ...(term?.properties || {}),
    };
}

function nestedGeometryWkt(feature: any): string | undefined {
    const featureProperties = termProperties(feature);
    for (const predicate of geomPredicates) {
        const geometries = featureProperties[predicate]?.objects || [];
        for (const geometry of geometries) {
            const wkt = termProperties(geometry)[GEO_AS_WKT]?.objects?.[0]?.value;
            if (wkt) return wkt;
        }
    }
    return undefined;
}

const relatedSpatialFeatures = computed(() => {
    const features = data.value?.data.properties?.[SCHEMA_SPATIAL_COVERAGE]?.objects || [];
    return features.map((term: any) => {
        const properties = termProperties(term);
        return {
            term,
            iri: term.value,
            name: term.label?.value || properties[SCHEMA_NAME]?.objects?.[0]?.value || term.value,
            wkt: nestedGeometryWkt(term),
            detailUrl: term.links?.[0]?.value,
        };
    });
});

const spatialCoverageLayers = computed(() => [{
    type: "FeatureCollection",
    title: "Agreement area",
    features: relatedSpatialFeatures.value
        .filter(feature => feature.wkt)
        .map(feature => ({
            type: "Feature",
            id: feature.iri,
            wkt: feature.wkt,
            name: feature.name,
            data: { iri: feature.iri },
        })),
}]);

const spatialMapSection = ref<string>();

const geomLayers = computed(() => {
    const layers = [];
    if (data.value?.data.properties) {
        const geomProps = Object.keys(data.value?.data.properties).filter(p => geomPredicates.includes(p));
        geomProps.forEach(p => {
            data.value.data.properties[p].objects.forEach(o => {
                layers.push({
                    "type": "FeatureCollection",
                    title: data.value?.data.label?.value || "",
                    "features": [{
                        type: "Feature",
                        wkt: o.properties["http://www.opengis.net/ont/geosparql#asWKT"].objects[0].value,
                        name: data.value?.data.label?.value || "",
                        data: {
                            iri: data.value?.data.value
                        }
                    }]
                })
            })
        });
    }
    return layers;
});

watch([() => resourceUri.value, () => resourceLabel.value], async ([newResourceUri, newResourceLabel]) => {
	provenance.value = await getProvenance(resourceUri.value, resourceLabel.value, apiEndpoint);
})

// Watch for changes in both globalProfiles and currentProfile
// Apply profile to item uses the current profile to order properties
// To do: use a loader to show that the profile is being applied
watch([() => globalProfiles.value, () => currentProfile.value], ([newGlobalProfiles, newCurrentProfile]) => {
  if (newGlobalProfiles && newCurrentProfile && newGlobalProfiles[newCurrentProfile.uri] ) {
    const profile = newGlobalProfiles[newCurrentProfile.uri];
    if (data.value && profile) {
        applyProfileToItem(data.value as PrezDataItem, profile);
    }
  }
});

// toggle functionality for ontologies
const open = ref<string[]>([]);
const page = ref(1);

function toggleOpen(value:string) {
	const idx = open.value.indexOf(value);
	if(idx >= 0) {
		open.value.splice(idx, 1);
	} else {
		open.value.push(value);
	}
}
const navigateToNode = (bblockNode: any) => {
	if (bblockNode?.links?.length > 0 && bblockNode.links[0].value) {
		router.push({ path: bblockNode.links[0].value });
	}
}

const navigateToUri = (uri?: string) => {
	if (uri && uri.length) {
		window.location.href = `/object?uri=${uri}`; // this needs a full refresh to reload the data
	}
}
</script>

<template>
    <NuxtLayout sidepanel>
        <template #header-text>
            <slot name="header-text" :data="data">
                <Node v-if="data" :key="data?.data.value" :term="data.data" variant="item-header" />
                <div v-else>&nbsp;</div>
            </slot>
        </template>

        <template #debug>
            <pre class="p-2"><small><b>{{currentProfile?.title}}</b><br>{{ dumpNodeArray(globalProfiles?.[currentProfile?.uri || '']) }}</small></pre>
        </template>

        <template #breadcrumb>
            <slot name="breadcrumb" :data="data">
                <div :key="data?.parents.join()">
                    <ItemBreadcrumb v-if="data" :prepend="appConfig.breadcrumbPrepend" :name-substitutions="appConfig.nameSubstitutions" :parents="data.parents" />
                    <ItemBreadcrumb v-else-if="error" :custom-items="[{url: '/', label: 'Unable to load page'}]" />
                    <ItemBreadcrumb v-else :prepend="appConfig.breadcrumbPrepend" :custom-items="[{url: '#', label: '...'}]" />
                </div>
            </slot>
        </template>

	    <template #profiles>
		    <ProfileSelector :key="status" :objectUri="data?.data.value" :apiUrl="apiUrl" :loading="status == 'pending'" :profiles="data?.profiles" />
	    </template>

        <template #default>
            <slot :data="data" :status="status" :is-concept-scheme="isConceptScheme" :top-concepts-url="topConceptsUrl">

                <slot name="top" :data="data" :status="status" :is-concept-scheme="isConceptScheme" :top-concepts-url="topConceptsUrl"></slot>

                <slot v-if="error" name="message">
                    <Message severity="error">{{ error }}</Message>
                </slot>

                <slot v-else-if="status == 'pending'" name="loading" :status="status">
                    <Loading variant="item" />
                </slot>

                <div v-else-if="data?.data" :key="data?.data.value">
                    <slot name="header-section" :data="data">
                        <slot name="header-top" :data="data"></slot>
                        <slot name="header-description" :data="data"></slot>
                        <slot name="header-middle" :data="data"></slot>
                        <slot name="header-identifiers" :data="data">
                            <div class="mb-2 mt-2 flex flex-row items-center">
                                <Badge variant="secondary" class="mr-2 rounded-md">IRI</Badge><ItemLink :secondary-to="data.data.value" copy-link>{{ data.data.value }}</ItemLink>
                            </div>
                            <div class="flex flex-row gap-3" v-if="data?.data.rdfTypes">
                                <Badge variant="secondary" class="self-start rounded-md">Type</Badge>
                                <div>
                                    <div v-for="rdfType in data.data.rdfTypes"><Node :term="rdfType" /></div>
                                </div>
                            </div>
                        </slot>
                        <slot name="header-bottom" :data="data"></slot>
                    </slot>
                    <div class="mt-4 mb-12 overflow-auto">
                        <slot name="item-section" :data="data" :is-concept-scheme="isConceptScheme" :top-concepts-url="topConceptsUrl">
                            <slot name="item-top" :data="data" :is-concept-scheme="isConceptScheme" :top-concepts-url="topConceptsUrl">
                                <div v-if="geomLayers.length > 0" class="h-[500px]">
                                    <Map
                                        :layers="geomLayers"
                                        :animationDuration="1000"
                                        fitAddedLayersToExtent
                                    />
                                </div>
                                <Accordion
                                    v-if="isCreativeWork && relatedSpatialFeatures.length > 0"
                                    v-model="spatialMapSection"
                                    type="single"
                                    collapsible
                                    class="mt-6 rounded-md border"
                                >
                                    <AccordionItem value="spatial-coverage-map" class="border-0">
                                        <AccordionTrigger class="px-4 py-3">
                                            Agreement area map
                                        </AccordionTrigger>
                                        <AccordionContent class="border-t px-4 pb-4 pt-3">
                                            <div class="mb-3 flex flex-col gap-2">
                                                <div
                                                    v-for="feature in relatedSpatialFeatures"
                                                    :key="feature.iri"
                                                    class="flex flex-wrap items-baseline justify-between gap-2"
                                                >
                                                    <strong>{{ feature.name }}</strong>
                                                    <ItemLink v-if="feature.detailUrl" :to="feature.detailUrl">
                                                        See full details
                                                    </ItemLink>
                                                </div>
                                            </div>
                                            <div
                                                v-if="spatialMapSection === 'spatial-coverage-map' && spatialCoverageLayers[0].features.length > 0"
                                                class="h-[500px] overflow-hidden rounded-md border"
                                            >
                                                <Map
                                                    :layers="spatialCoverageLayers"
                                                    :animationDuration="1000"
                                                    fitAddedLayersToExtent
                                                />
                                            </div>
                                            <p v-else class="text-sm text-muted-foreground">
                                                Map geometry is not available from this catalogue.
                                            </p>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </slot>

	                        <div class="ontology-widget" v-if="isOntology">
		                        <slot name="item-ontology-classes" :data="data" :is-concept-scheme="isConceptScheme" :is-ontology="isOntology">
			                        <div class="mt-6" v-if="isOntology && (data.data as PrezOntologyNode).ontologyClasses.length > 0">
				                        <div class="pz-concept-node h-9">
					                        <b>Classes</b>
					                        <Button variant="ghost" size="icon" @click="toggleOpen('classes')">
						                        <ChevronRight v-if="!open.includes('classes')" class="size-4" />
						                        <ChevronDown v-else class="size-4" />
					                        </Button>
				                        </div>
				                        <div v-if="open.includes('classes')" class="mt-4 flex flex-col gap-2 pz-concept-children">
					                        <Node v-for="ontologyClass in (data.data as PrezOntologyNode).ontologyClasses" :term="ontologyClass" />
				                        </div>
			                        </div>
		                        </slot>

		                        <slot name="item-ontology-properties" :data="data" :is-concept-scheme="isConceptScheme" :is-ontology="isOntology">
			                        <div class="mt-6" v-if="isOntology && (data.data as PrezOntologyNode).ontologyProperties.length > 0">
				                        <div class="pz-concept-node h-9">
					                        <b>Properties</b>
					                        <Button variant="ghost" size="icon" @click="toggleOpen('properties')">
						                        <ChevronRight v-if="!open.includes('properties')" class="size-4" />
						                        <ChevronDown v-else class="size-4" />
					                        </Button>
				                        </div>
				                        <div v-if="open.includes('properties')" class="mt-4 flex flex-col gap-2 pz-concept-children">
					                        <Node v-for="ontologyProperty in (data.data as PrezOntologyNode).ontologyProperties" :term="ontologyProperty" />
				                        </div>
			                        </div>
		                        </slot>
	                        </div>

	                        <slot name="item-bblock-dependencies" :data="data">
		                        <div class="mt-6" v-if="isBBlock && (data.data as PrezBBlockNode).dependsOn?.length > 0">
			                        <p><b>Dependencies</b></p>
			                        <div class="mt-4 flex flex-col gap-2">
				                        <DependencyViewer v-if="isBBlock"
				                                          :data="data.data"
				                                          @node:click="navigateToNode"
				                        />
			                        </div>
		                        </div>
	                        </slot>

                            <slot name="item-table" :data="data" :is-concept-scheme="isConceptScheme" :top-concepts-url="topConceptsUrl">

                                <ItemTable
                                    :term="data.data" 
                                    :key="urlPath + globalProfiles?.length + currentProfile?.uri" 
                                    :is-concept-scheme="isConceptScheme"
                                    :top-concepts-url="topConceptsUrl"
                                />

                            </slot>
                            <slot name="item-middle" :data="data" :is-concept-scheme="isConceptScheme" :top-concepts-url="topConceptsUrl"></slot>

                            <slot name="item-members" :data="data" :is-concept-scheme="isConceptScheme" :top-concepts-url="topConceptsUrl">
                                <Button
                                    v-if="currentProfile?.uri !== 'https://prez.dev/OGCSchemesObjectProfile' && !data.data.rdfTypes?.some(t => nonMemberTypes.includes(t.value)) && data.data.members"
                                    class="mt-6"
                                    as-child
                                >
                                    <ItemLink :to="data.data.members.value">Members</ItemLink>
                                </Button>
                            </slot>

                            <slot name="item-collections" :data="data" :is-concept-scheme="isConceptScheme">
                                <div class="mt-6" v-if="isConceptScheme && (data.data as PrezConceptSchemeNode).collections.length > 0">
                                    <p><b>Collections</b></p>
                                    <div class="mt-4 flex flex-col gap-2">
                                        <Node v-for="collection in (data.data as PrezConceptSchemeNode).collections" :term="collection" />
                                    </div>
                                </div>
                            </slot>

                            <slot name="item-concepts" :data="data" :is-concept-scheme="isConceptScheme" :top-concepts-url="topConceptsUrl">
                                <div class="mt-6" v-if="isConceptScheme && topConceptsUrl != ''">
                                    <p><b>Concept Hierarchy</b></p>
                                    <div class="mt-4">
                                        <ConceptHierarchy
                                            :base-url="apiEndpoint" 
                                            :url-path="topConceptsUrl"
                                        />
                                    </div>
                                </div>
                            </slot>

	                        <slot name="item-provenance" :data="data">
		                        <div class="mt-6" v-if="provenance?.wasDerivedFrom?.length">
			                        <p><b>Provenance</b></p>
			                        <div class="mt-4 flex flex-col gap-2">
				                        <ProvenanceDiagram :data="provenance" @node:click="(n)=>{ navigateToUri(n.id); }" />
			                        </div>
		                        </div>
	                        </slot>

                            <slot name="item-bottom" :data="data" :is-concept-scheme="isConceptScheme" :top-concepts-url="topConceptsUrl"></slot>
                        </slot>
                    </div>
                </div>
                
                <slot name="bottom" :data="data" :status="status" :is-concept-scheme="isConceptScheme" :top-concepts-url="topConceptsUrl"></slot>
            </slot>
        </template>

        <template #sidepanel>
            <slot name="profiles" :data="data" :apiUrl="apiUrl" :status="status">
                <ItemProfiles :key="status" :objectUri="(route.query.uri as string)" :apiUrl="apiUrl" :loading="status == 'pending'" :profiles="data?.profiles" />
            </slot>
        </template>

    </NuxtLayout>
</template>

<!-- <style>
/* disabled controls for now as Tailwind CSS cannot be loaded into Prez UI due to Tailwind version conflicts */
.kai-map .ol-control, .kai-map .ol-scale-line {
    display: none !important;
}
</style> -->

<style scoped>
.pz-concept-node {
	place-items: end;
	align-items: center;
	display: flex;
	gap: 8px;
	/* margin-bottom: 10px; */
}
.pz-concept .pz-concept {
	padding-left:20px;
}
.ontology-widget {
	margin-bottom: 1em;
}
</style>
