<script lang="ts" setup>
import type { HTMLAttributes } from "vue";
import type { PrezTerm } from "prez-lib";
import { cn } from "~/lib/utils";

const props = defineProps<{
    term: PrezTerm;
    variant?: 'item-table' | 'item-list' | 'item-header' | 'search-results' | 'item-profiles';
    renderHtml?: boolean;
    renderMarkdown?: boolean;
    class?: HTMLAttributes["class"];
}>();

// prez API loads reg status annotations locally instead of from triplestore
// labels from pm sync didn't load status data from labels file
const colorMap: Record<string, string> = {
    "https://linked.data.gov.au/def/reg-statuses/accepted": "#1bc13f",
    "https://linked.data.gov.au/def/reg-statuses/addition": "#4ac11b",
    "https://linked.data.gov.au/def/reg-statuses/deprecated": "#a86a0d",
    "https://linked.data.gov.au/def/reg-statuses/experimental": "#eae72c",
    "https://linked.data.gov.au/def/reg-statuses/invalid": "#ea3c2c",
    "https://linked.data.gov.au/def/reg-statuses/notAccepted": "#ea9e2c",
    "https://linked.data.gov.au/def/reg-statuses/original": "#38a30e",
    "https://linked.data.gov.au/def/reg-statuses/reserved": "#9b8d79",
    "https://linked.data.gov.au/def/reg-statuses/retired": "#ad5b24",
    "https://linked.data.gov.au/def/reg-statuses/stable": "#2e8c09",
    "https://linked.data.gov.au/def/reg-statuses/submitted": "#248bad",
    "https://linked.data.gov.au/def/reg-statuses/superseded": "#ad7624",
    "https://linked.data.gov.au/def/reg-statuses/unstable": "#678c09",
    "https://linked.data.gov.au/def/reg-statuses/valid": "#36a80d",
};
</script>

<template>
    <div :class="cn('flex flex-row items-center gap-2', props.class)">
        <div class="rounded-full size-4" :style="{ backgroundColor: colorMap[props.term.value] || 'transparent' }"></div>
        <Term
            :term="props.term"
            :variant="props.variant"
            :renderHtml="props.renderHtml"
            :renderMarkdown="props.renderMarkdown"
        />
    </div>
</template>
