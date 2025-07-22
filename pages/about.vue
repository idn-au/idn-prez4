<script lang="ts" setup>
const appConfig = useAppConfig();
</script>

<template>  
    <NuxtLayout>
        <template #breadcrumb>
            <slot name="breadcrumb">
                    <ItemBreadcrumb :custom-items="[...appConfig.breadcrumbPrepend, {label: 'About'}]" />
            </slot>
        </template>
        <template #header-text>
            About
        </template>
        <template #default>
            <h2 class="text-2xl my-4">Purpose & Governance</h2>
            <p class="my-2">
                These catalogues are managed and governed by the <a href="https://mspgh.unimelb.edu.au/centres-institutes/onemda/research-group/indigenous-studies-unit" target="_blank" rel="noopener noreferrer">Indigenous Studies Unit</a> at the <a href="https://www.unimelb.edu.au/" target="_blank" rel="noopener noreferrer">University of Melbourne</a> which leads the <a href="https://idnau.org/" target="_blank" rel="noopener noreferrer">Indigenous Data Network (IDN)</a>. The IDN carries out programs of work to assist Australian holders of Indigenous data - both Indigenous and non-Indigenous organisations - to manage their data better.
            </p>
            <p class="my-2">
                This multi-catalogue system contains both primary catalogues - catalogues that contain the only catalogued instances of an organisation's data, such as <a href="https://data.idnau.org/pid/isu-catalogue" target="_blank" rel="noopener noreferrer">the ISU's own catalogue</a>, and also catalogues of data provided to help organisations with the characterisation of their Indigenous data. The main two such catalogues are the <a href="https://data.idnau.org/pid/refdata" target="_blank" rel="noopener noreferrer">Reference Data Catalogue</a> and the <a href="https://data.idnau.org/pid/vocabs" target="_blank" rel="noopener noreferrer">IDN Vocabularies</a>.
            </p>
            <p class="my-2">
                The <a href="https://data.idnau.org/pid/refdata" target="_blank" rel="noopener noreferrer">Reference Data Catalogue</a> contains multiple spatial datasets with Indigenous areas such as the spatial the <a href="https://data.idnau.org/pid/atns" target="_blank" rel="noopener noreferrer">Agreements, Treaties and Negotiated Settlements (ATNS) Database</a> and the <a href="https://data.idnau.org/pid/nntt" target="_blank" rel="noopener noreferrer">Native Title Tribunal Dataset</a>.
            </p>
            <p class="my-2">
                The IDN Vocabularies catalogue contains collections of defined terms relevant to Indigenous data and metadata, such as <a href="https://data.idnau.org/pid/vocab/persons-indigenous-status" target="_blank" rel="noopener noreferrer">Indigenous Status of Person</a> and <a href="https://data.idnau.org/pid/vocab/indigeneity" target="_blank" rel="noopener noreferrer">Data Indigeneity</a>.
            </p>

            <h2 class="text-2xl my-4">Data</h2>
            <p class="my-2">
                The data in these catalogues is stored according to the <a href="https://data.idnau.org/pid/cp/spec" target="_blank" rel="noopener noreferrer">IDN's Catalogue Profile</a> which is a metadata model, created by the IDN, specifically for data cataloguing of Australian Indigenous data. It is based on standard catalogue data models - <a href="https://www.w3.org/TR/vocab-dcat-3/" target="_blank" rel="noopener noreferrer">DCAT</a>, <a href="https://www.dublincore.org/specifications/dublin-core/dcmi-terms/" target="_blank" rel="noopener noreferrer">DCTERMS</a> & <a href="https://schema.org/" target="_blank" rel="noopener noreferrer">schema.org</a> - but it both constrains and extends them to promote the linking of data to policies, the detailed descriptions of agents and the use of common keywords about Indigenous content.
            </p>
            <p class="my-2">
                The data is stored in the standardised, generic and open source, <a href="https://en.wikipedia.org/wiki/Resource_Description_Framework" target="_blank" rel="noopener noreferrer">RDF</a> data format which can be read by both humans and machines. This data can be understood by many free and commercial tools.
            </p>
            <p class="my-2">
                The RDF data that makes the content of these catalogues may be accessed through the web pages of this system but may also be queried directly at the <a href="https://github.com/sparql" target="_blank" rel="noopener noreferrer">SPARQL Query endpoint</a> which allows unfettered access to all content and for the creation of scripted data extraction and automated systems integration.
            </p>
            <h3 class="text-xl my-2">Licenses</h3>
            <p class="my-2">
                Most of the data in this system is licensed for fair reuse using the <a href="https://creativecommons.org/licenses/by/4.0/deed.en" target="_blank" rel="noopener noreferrer">Creative Commons BY 4.0</a> license, but check each dataset's metadata for specifics.
            </p>

            <h2 class="text-2xl my-4">System</h2>
            <p class="my-2">
                The software used for this multi-catalogue system is <a href="https://prez.dev/" target="_blank" rel="noopener noreferrer">Prez</a>, an open database, Application Programming Interface (API) and user interface (UI) system that implements <a href="https://www.w3.org/standards/semanticweb/data" target="_blank" rel="noopener noreferrer">Linked Data</a> methods for providing access to data.
            </p>
            <p class="my-2">
                Prez implements many common APIs for data access such as the <a href="https://www.w3.org/TR/sparql12-protocol/" target="_blank" rel="noopener noreferrer">SPARQL Protocol</a>, <a href="https://docs.ogc.org/is/17-069r3/17-069r3.html" target="_blank" rel="noopener noreferrer">OGC API:Features</a> for spatial data and also simple web pages.
            </p>
            <h3 class="text-xl my-2">License</h3>
            <p class="my-2">
                Prez is licensed for free reuse, including commercial reuse, using the <a href="https://opensource.org/license/bsd-3-clause" target="_blank" rel="noopener noreferrer">BSD 3-Clause</a> licence.
            </p>
            <h3 class="text-xl my-2">Documentation</h3>
            <p class="my-2">
                See the <a href="http://prez.dev/" target="_blank" rel="noopener noreferrer">Prez homepage</a> for detailed Prez documentation.
            </p>
        </template>
    </NuxtLayout>
</template>