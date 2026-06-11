<script lang="ts" setup>
import { type HTMLAttributes } from "vue";
import {fromExtent} from 'ol/geom/Polygon';
import {WKT} from "ol/format";
import BaseMap from "./BaseMap.vue";
import MapButton from "./MapButton.vue";
import { cn } from "~/lib/utils";

const props = defineProps<{
	features: any[];
	loading?: boolean;
    class?: HTMLAttributes["class"];
}>();

const bboxSelected = ref(false);

const baseMapRef = useTemplateRef("baseMapRef");

const within = defineModel<string>();

const wktFormat = new WKT();

function handleDraw(geometry: { geoJSON: string; wkt: string; }) {
	within.value = geometry.wkt;
	bboxSelected.value = false;
}

function searchWithinBbox() {
	if (baseMapRef.value?.viewRef) {
		bboxSelected.value = true;
		const extent = baseMapRef.value.viewRef.view.getViewStateAndExtent().extent;
		const polygon = fromExtent(extent);
		within.value = wktFormat.writeGeometry(polygon, {
			dataProjection: "EPSG:4326",
		});
	}
}

function wrappedSelectFeatureByIRI(iri: string, fitToFeatureExtent: boolean) {
	return baseMapRef.value?.selectFeatureByIRI(iri, fitToFeatureExtent);
}

defineExpose({
	selectFeatureByIRI: wrappedSelectFeatureByIRI,
});

watch(within, (newValue) => {
	if (newValue === "") {
		bboxSelected.value = false;
	}
});
</script>

<template>
    <ClientOnly>
        <div :class="cn('', props.class)">
            <div class="flex flex-col gap-4">
                <BaseMap
                    ref="baseMapRef"
                    class="h-[500px]"
                    :layers="[props.features]"
                    fitAddedLayersToExtent
                    :animationDuration="1000"
                    enableToolbar
                    enableDrawing
                    :loading="props.loading"
                    @drawend="handleDraw"
                    @clearDrawing="within = ''; bboxSelected = false;"
                >
                    <template #controls>
	                    <MapButton class="left-12 top-2" :variant="bboxSelected ? 'default' : 'outline'" @click="searchWithinBbox">
		                    Select current area
	                    </MapButton>
                    </template>
                </BaseMap>
            </div>
        </div>
    </ClientOnly>
</template>
