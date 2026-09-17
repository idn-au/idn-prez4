<script lang="ts" setup>
import { ArrowRight } from "lucide-vue-next";
</script>

<template>
    <NuxtLayout contentonly>
	    <template #header-text>The Indigenous Data Network Catalogue</template>
        <template #default>
            <p>
                This catalogue contains data held by the <a href="https://idnau.org/" target="_blank" rel="noopener noreferrer">Indigenous Data Network (IDN)</a> and the <a href="https://mspgh.unimelb.edu.au/centres-institutes/onemda/research-group/indigenous-studies-unit" target="_blank" rel="noopener noreferrer">University of Melbourne's Indigenous Studies Unit</a> on behalf of partner organisations. Some of this data is only catalogued here and is held by the IDN for safekeeping. Other data is to be used as reference material for Indigenous data cataloging elsewhere, such as vocabularies of Indigenous data terms.
            </p>
            <Button as-child class="mt-4">
                <NuxtLink to="/catalogs/pid:indigenous-data-catalogue">Go to the catalogue<ArrowRight class="size-4" /></NuxtLink>
            </Button>
	        <PortalSearch />
        </template>
    </NuxtLayout>
</template>

<style scoped>
p {
    margin: 0.5rem 0;
}
</style>