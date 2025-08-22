<script lang="ts" setup>
import { type PrezFocusNode } from "prez-lib";
import { type ItemTableProps } from "prez-components";

const props = defineProps<ItemTableProps>();
const term = props.term as PrezFocusNode;

const hiddenPredicates = [
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "https://schema.org/hasPart",
    "https://schema.org/name",
    "https://olis.dev/isAliasFor",
    "http://www.w3.org/2004/02/skos/core#prefLabel",
    "http://purl.org/dc/terms/title",
    "http://www.w3.org/2000/01/rdf-schema#label",
];

const descPredicates = [
    "http://www.w3.org/2004/02/skos/core#definition",
    "http://purl.org/dc/terms/description",
    "https://schema.org/description"
];

const filteredProperties = computed(() => {
    if (term?.properties) {
        return Object.entries(term.properties)
            .filter(([key, value]) => !hiddenPredicates.includes(key))
            .map(([key, value]) => value)
            .sort((a, b) => {
            if (descPredicates.includes(a.predicate.value)) { // description first
                return -1;
            } else if (descPredicates.includes(b.predicate.value)) {
                return 1;
            } else {
                return a.predicate.label?.value.localeCompare(b.predicate.label?.value);
            }
        });
    } else {
        return [];
    }
});
</script>

<template>
    <!-- ItemTable -->
    <Table v-if="term?.properties" class="item-table">
        <TableBody role="rowgroup">
            <ItemTableRow v-for="(fieldProp, index) in filteredProperties"
                :key="fieldProp?.predicate.value" 
                :index="index"
                :term="term" 
                :objects="fieldProp ? fieldProp.objects : []" 
                :predicate="fieldProp!.predicate"
                :renderHtml="props.renderHtml"
                :renderMarkdown="props.renderMarkdown"
            />
        </TableBody>
    </Table>
</template>
