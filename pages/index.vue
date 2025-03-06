<script lang="ts" setup>
import { ArrowRight } from "lucide-vue-next";
</script>

<template>
    <NuxtLayout contentonly>
        <template #default>
            <h1 class="text-3xl mt-4 mb-6">The Indigenous Data Network Catalogue</h1>
            <p>
                The Indigenous Data Network (IDN) catalogue is a data catalogue which uses metadata to allow for discoverability, reusability and interoperability of datasets. While a data catalogue doesn't hold data itself, it can point to where the data can be accessed. The IDN catalogue acts as a "catalogue of catalogues", containing multiple catalogues important to the IDN.
            </p>
            <ul class="list-disc ml-8 mb-4">
                <li>
                    The <NuxtLink to="/catalogs/ns3:vocabs">IDN reference data catalogue</NuxtLink> contains publicly available vocabularies that are used throughout other IDN systems.
                </li>
                <li>
                    The IDN demonstration catalogue (to be added) contains simple datasets to demonstrate improved metadata models and rating systems for data and metadata in order to improve Indigenous Data Governance.
                </li>
                <li>
                    The ISU catalogue (to be added) is a catalogue for datasets managed by the Indigenous Studies Unit (ISU) at the University of Melbourne.
                </li>
                <li>
                    The keeping place catalogue (to be added) is for Indigenous datasets that do not have a home elsewhere.
                </li>
            </ul>
            <Button as-child>
                <NuxtLink to="/catalogs">Go to catalogs<ArrowRight class="size-4" /></NuxtLink>
            </Button>
        </template>
    </NuxtLayout>
</template>

<style scoped>
p {
    margin: 0.5rem 0;
}
</style>