<script lang="ts" setup>
import Yasgui from "@triply/yasgui";
import "@triply/yasgui/build/yasgui.min.css";

const apiEndpoint = useGetPrezAPIEndpoint();
const appConfig = useAppConfig();

onMounted(() => {
    const yasgui = new Yasgui(document.getElementById("yasgui")!, {
        requestConfig: {
            endpoint: `${apiEndpoint}/sparql`,
            method: "POST"
        },
        copyEndpointOnNewTab: true,
        autofocus: true,
    });
});
</script>

<template>  
    <NuxtLayout>
        <template #breadcrumb>
            <slot name="breadcrumb">
                <ItemBreadcrumb :custom-items="[...appConfig.breadcrumbPrepend, {label: 'SPARQL'}]" />
            </slot>
        </template>
        <template #header-text>
            SPARQL Queries
        </template>
        <template #default>
            <p class="my-2">
                Here you can write <a href="https://www.youtube.com/watch?v=FvGndkpa4K0" target="_blank" rel="noopener noreferrer">SPARQL</a> queries to interrogate the metadata and data within the IDN's catalogue. This allows for custom data exports and systems integration.
            </p>
            <div class="my-8" id="yasgui"></div>
            <h2 class="text-2xl my-4">Example Queries</h2>

            <h3 class="text-xl my-2">Basic SELECT for items in a Catalogue</h3>
            <CodeBlock># lists all the items in the ISU Catalogue, ordered alphabetically by title
PREFIX schema: &lt;https://schema.org/&gt;

SELECT ?item ?title
WHERE {
	&lt;https://data.idnau.org/pid/isu-catalogue&gt; schema:hasPart ?item .
	?item schema:name ?title .
} 
ORDER BY ?title</CodeBlock>
            <p class="my-2">This query should return the IRI - identifier - and title of ~16 catalogue entries.</p>

            <h3 class="text-xl my-2">Search for items by word in description</h3>
            <CodeBlock>PREFIX schema: &lt;https://schema.org/&gt;

SELECT ?item ?title ?desc
WHERE {
    ?item schema:name ?title ;
        schema:description ?desc .
  
    FILTER REGEX(?desc, "lajamanu", "i")
} 
ORDER BY ?title</CodeBlock>
            <p class="my-2">This should return a single catalogue item with the title <em>Warlpiri Collection (Barbara Glowczewski)</em>.</p>
        </template>
    </NuxtLayout>
</template>

<style>
/** disable endpoint selector */
.yasgui .controlbar {
    display: none !important;
}
</style>