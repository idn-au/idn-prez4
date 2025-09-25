<script lang="ts" setup>
import { X, Focus } from "lucide-vue-next";
import type Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";

const props = defineProps<{
    type?: string;
    iri?: string; // the object iri to link to
    queryString?: string; // an optional querystring that will be included with the object uri. E.g., an alternate prez profile
    selectedFeature: Feature<Geometry>;
}>();

const emit = defineEmits<{
    deselect: [feature: Feature<Geometry>];
    select: [selectedFeature: Feature<Geometry>, fitFeatureToExtent: boolean];
}>();

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

function convertToTitleCase(text: string) {
    if (text.length > 1) {
        return text.charAt(0).toUpperCase() + text.replace(/([A-Z])/g, " $1").slice(1);
    }
    return text;
}

onMounted(() => {
    document.addEventListener("keyup", onEscape);
});

onUnmounted(() => {
    document.removeEventListener("keyup", onEscape);
});
</script>

<template>
    <div class="tooltip-content">
        <div class="font-bold flex flex-row items-center justify-between">
            <span class="" @click="select(false)"><slot name="title">{{ props.selectedFeature.name }}</slot></span>
            <div class="flex flex-row items-center gap-2">
                <Button variant="ghost" size="icon" class="" aria-label="Select and zoom" title="Select and zoom" @click="select(true)"><Focus class="size-4" /></Button>
                <Button variant="ghost" size="icon" class="" aria-label="Close" title="Close" @click="deselect"><X class="size-4" /></Button>
            </div>
        </div>
        <div v-if="props.selectedFeature.type" class="type">{{ props.selectedFeature.type }}</div>
        <div class="tooltip-attribute" v-if="props.selectedFeature.data && props.selectedFeature.data.iri">
            <a class="tooltip-iri" :href="`/object?uri=${props.selectedFeature.data.iri}${props.queryString? '&' + props.queryString : ''}`" target="_blank">{{props.selectedFeature.data.iri}}</a>
        </div>
        <!-- <div class="metadata">
            <slot name="metadata">
              <div v-if="props.selectedFeature.data" v-for="item in Object.keys(props.selectedFeature.data)">
                <div class="tooltip-attribute flex flex-row" v-if="['iri', 'name', 'wktGeometry'].indexOf(item) === -1">
                  <div class="attribute-title">
                   <b>{{convertToTitleCase(item)}}</b>:
                  </div>
                  <div class="ml-1">{{ props.selectedFeature.data[item] }}</div>
                </div>
              </div>
            </slot>
        </div> -->
    </div>
</template>

<style lang="scss" scoped>
$arrow-size: 8px;

.tooltip-content {
    background-color: rgba(255,255,255,1);
    border: 1px solid #cccccc;
    padding: 12px;
    border-radius: 0.25rem;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: $arrow-size; // offset arrow height
    min-width: 500px;
    max-width: 700px;

    .title {
        font-weight: bold;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;

        a {
            color: #0284c7;

            &:hover {
                color: #0ea5e9;
            }
        }

        button.map-tooltip-close-btn {
            color: grey;
            font-size: 1rem;
            margin-top: -6px;

            &:hover {
                color: black;
            }
        }
    }

    .type {
        font-size: 0.9rem;
        color: grey;
        font-style: italic;
        font-weight: normal;
        margin-top: -8px;
    }

    .metadata {
        font-family: monospace;
        background-color: #f0f0f0;
        padding: 4px;
    }

    &:not(.loading)::after {
        content: " ";
        position: absolute;
        top: calc(100% - 1px - $arrow-size); // covers border, offset arrow height
        left: 50%;
        margin-left: -$arrow-size;
        border-width: $arrow-size;
        border-style: solid;
        border-color: white transparent transparent transparent;
    }

    .tooltip-attribute {
        .tooltip-iri {
            font-size: smaller;
        }
    }
}
</style>
