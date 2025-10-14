<script lang="ts" setup>
import { X, Focus, ChevronRight } from "lucide-vue-next";
import type Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";

const props = defineProps<{
    // type?: string;
    // iri?: string; // the object iri to link to
    // queryString?: string; // an optional querystring that will be included with the object uri. E.g., an alternate prez profile
    selectedFeature: Feature<Geometry>;
}>();

const emit = defineEmits<{
    deselect: [feature: Feature<Geometry>];
    select: [selectedFeature: Feature<Geometry>, fitFeatureToExtent: boolean];
}>();

const properties = computed(() => props.selectedFeature.getProperties() as DataFeatureProperties);

function select(fitToFeatureExtent: boolean) {
    emit("select", props.selectedFeature, fitToFeatureExtent);
}

function deselect() {
    emit("deselect", props.selectedFeature);
}

function onEscape(e: KeyboardEvent) {
    if (e.key === "Escape") {
        deselect();
    }
}

onMounted(() => {
    document.addEventListener("keyup", onEscape);
});

onUnmounted(() => {
    document.removeEventListener("keyup", onEscape);
});
</script>

<template>
    <div class="bg-background p-3 rounded-md shadow-md flex flex-col gap-2 max-w-full map-tooltip">
        <div class="font-bold flex flex-row items-start justify-between gap-4">
            <div class="flex flex-row gap-2 items-center">
                <span class="flex flex-row gap-1 items-center">
                    <NuxtLink :to="`/object?uri=${properties.iri}`" @click="select(false)" class="font-bold">
                        {{ properties.name }}
                    </NuxtLink>
                </span>
            </div>
            <div class="flex flex-row items-center gap-2">
                <Button variant="ghost" size="icon" class="" aria-label="Select and zoom" title="Select and zoom" @click="select(true)"><Focus class="size-4" /></Button>
                <Button variant="ghost" size="icon" class="" aria-label="Close" title="Close" @click="deselect"><X class="size-4" /></Button>
            </div>
        </div>
        <a :href="properties.iri" target="_blank" rel="noopener noreferrer" class="font-mono text-xs">{{ properties.iri }}</a>
        <div class="flex flex-row items-center gap-2 !text-muted-foreground text-xs">
            <NuxtLink :to="`/object?uri=${properties.d}`">{{ properties.dLabel }}</NuxtLink>
            <ChevronRight class="size-4" />
            <NuxtLink :to="`/object?uri=${properties.fc}`">{{ properties.fcLabel }}</NuxtLink>
            <ChevronRight class="size-4" />
            <NuxtLink :to="`/object?uri=${properties.iri}`" class="font-bold">{{ properties.name }}</NuxtLink>
        </div>
    </div>
</template>

<style scoped>
.map-tooltip {
    margin-bottom: 8px;
}

.map-tooltip::after {
    content: " ";
    position: absolute;
    top: calc(100% - 1px - 8px);
    left: 50%;
    margin-left: -8px;
    border-width: 8px;
    border-style: solid;
    border-color: white transparent transparent transparent;
}
</style>
