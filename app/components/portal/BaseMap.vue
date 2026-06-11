<script lang="ts" setup>
import { type HTMLAttributes } from "vue";
import {Trash, Eraser, Pentagon, LoaderCircle, PencilRuler, ChevronsDown, View} from "lucide-vue-next";
import { OlMap, OlView, OlOverlay } from "vue3-openlayers/map";
import { OlTileLayer, OlVectorLayer } from "vue3-openlayers/layers";
import { OlSourceOSM, OlSourceVector } from "vue3-openlayers/sources";
import { OlFullScreenControl, OlZoomSliderControl, OlScaleLineControl, OlLayerSwitcherControl } from "vue3-openlayers/controls";
import { OlStyle, OlStyleStroke, OlStyleCircle, OlStyleFill } from "vue3-openlayers/styles";
import { OlInteractionSelect, OlInteractionDraw, OlInteractionMouseWheelZoom } from "vue3-openlayers/interactions";
import { type Vue3OpenlayersGlobalOptions } from "vue3-openlayers";
import { GeoJSON, WKT } from "ol/format";
import { bbox } from "ol/loadingstrategy";
import { click } from "ol/events/condition";
import { getCenter } from "ol/extent";
import { SelectEvent } from "ol/interaction/Select";
import Style from "ol/style/Style";
import { getArea } from "ol/sphere";
import type { Extent } from "ol/extent";
import type { ProjectionLike } from "ol/proj";
import type { Type as GeometryType } from "ol/geom/Geometry";
import type { DrawEvent } from "ol/interaction/Draw";
import type Geometry from "ol/geom/Geometry";
import type Feature from "ol/Feature";
import { platformModifierKeyOnly } from "ol/events/condition";
import { cn } from "~/lib/utils";
import "ol/ol.css";
import "vue3-openlayers/vue3-openlayers.css";
import type { FeatureLike } from "ol/Feature";
import MapTooltip from "./MapTooltip.vue";
import MapButton from "./MapButton.vue";

const drawStyle: MapStyle = {
    strokeWidth: 2,
    strokeColor: "blue",
    fillColor: "rgba(125, 125, 255, 0.4)",
    radius: 6,
    circleColor: "rgba(125, 125, 255, 0.4)",
    circleStrokeWidth: 1,
    circleStrokeColor: "black",
};

// const hoverStyle: MapStyle = {
//     strokeWidth: 4,
//     strokeColor: "blue",
//     fillColor: "rgba(125, 125, 255, 0.8)",
//     radius: 6,
//     circleColor: "rgba(125, 125, 255, 0.48",
//     circleStrokeWidth: 1,
//     circleStrokeColor: "black",
// };

const props = withDefaults(defineProps<{
    center?: [number, number];
    zoom?: number;
    rotation?: number;
    projection?: ProjectionLike;
    focusSourceRef?: any;
    layers?: DataFeatureCollection[];
    loading?: boolean;
    clearDrawingsOnLayerChange?: boolean;
	// replaceDrawing?: boolean; // TODO
    fitAddedLayersToExtent?: boolean;
    animationDuration?: number;
    enableToolbar?: boolean;
    enableDrawing?: boolean;
    enableClearFeatures?: boolean;
    // TODO: ideally, we just add a slot to the tooltip for customization
    tooltipIriQueryString?: string;
    // See https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html for overriding styles
    layersOverrideStyleFunction?: Function;
    class?: HTMLAttributes["class"];
}>(), {
    center: () => [133.7751, -25.2744],
    zoom: 4,
    rotation: 0,
    projection: "EPSG:4326",
    layers: () => [],
});

const emit = defineEmits<{
    drawstart: [geometry: string];
    drawend: [geometry: { geoJSON: string; wkt: string; }];
    select: [feature: Feature<Geometry>];
    // hover: [];
    clearDrawing: [];
}>();

const mapRef = useTemplateRef("mapRef");
const viewRef = useTemplateRef("viewRef");
const layersRef = useTemplateRef("layersRef");
const layerSourcesRef = useTemplateRef("layerSourcesRef");
const clickSelectRef = useTemplateRef("clickSelectRef");
const drawSourceRef = useTemplateRef("drawSourceRef");

defineExpose({
	escapeOverlay,
	selectFeatureByIRI,
	// fitToExtent,
	viewRef,
});

const options: Vue3OpenlayersGlobalOptions = {
    debug: false,
};

provide("ol-options", options);

const modifierKeySymbol = import.meta.client && navigator.platform.startsWith("Mac") ? "⌘" : "ctrl";

const selectedFeature = ref<MapFeature | undefined>(undefined);
const selectedFeatures = ref<MapFeature[]>([]);
const selectedPosition = ref<[number, number] | undefined>(undefined);

function getFeatureCenter(feature?: Feature<Geometry>) {
    if (feature && feature.getGeometry) {
        return getCenter(feature.getGeometry()!.getExtent());
    }
    return undefined;
}

function selectFeatureByIRI(iri: string, fitToFeatureExtent: boolean) {
    if (layersRef.value) {
        const feature = layersRef.value.map(l => l.vectorLayer.getSource()?.getFeatureById(iri))[0] || undefined;
        if (feature) {
            selectFeature(feature, fitToFeatureExtent);
        }
    }
}

function selectFeature(feature: MapFeature, fitToFeatureExtent: boolean) {
    selectedFeatures.value = [];
    selectedFeature.value = feature;
    selectedPosition.value = getFeatureCenter(feature);
    if (clickSelectRef.value) {
        clickSelectRef.value.select.getFeatures().clear();
        clickSelectRef.value.select.getFeatures().push(feature);
    }
    if (fitToFeatureExtent && feature.getGeometry()) {
        const extent = feature.getGeometry()!.getExtent();
        fitToExtent(extent);
    }
    if (selectedFeature.value.getProperties().name) {
        emit("select", feature);
    }
}

function featureClick(e: SelectEvent) {
    let selection = undefined;

    if (e.selected.length > 0) {
        // depending on props.clickThroughOverlappingFeatures, we handle 1 selected feature, or all of the features at the clicked location
        // 1. handle the feature on top
        selectedFeature.value = e.selected[0];
        selection = getFeatureCenter(e.selected[0]);
        selectedPosition.value = selection;
        // 2. handle all features at the clicked location
        const clickLocation = e.mapBrowserEvent.pixel;

        const overlappingFeatures: any[] = [];
        if (mapRef.value) {
            mapRef.value.forEachFeatureAtPixel(
                clickLocation,
                function (feature: FeatureLike) {
                    if (feature.getProperties().name) {
                        overlappingFeatures.push(feature);
                    }
                },
            );
        }
        selectedFeatures.value = overlappingFeatures;
    } else {
        selectedFeature.value = undefined;
        selectedFeatures.value = [];
    }
    if (selectedFeature.value?.getProperties().name) {
        emit("select", selectedFeature.value);
    }
}

function escapeOverlay(selectedFeatureIndex: number) {
    if (clickSelectRef.value && selectedFeature.value) {
        clickSelectRef.value.select.getFeatures().clear();
        selectedFeature.value = undefined;
    }
    if (selectedFeatureIndex > -1) {
        selectedFeatures.value.splice(selectedFeatureIndex, 1);
    } else {
        selectedFeatures.value = [];
    }
}

const drawType = ref<GeometryType>("Polygon");
const drawModeEnabled = ref(false);

function toggleDrawMode() {
    drawModeEnabled.value = !drawModeEnabled.value;
}

const drawnFeatures = ref<Feature<Geometry>[]>([]);

function drawstart(event: DrawEvent) {
    emit("drawstart", geoJSONFormat.writeFeature(event.feature, { dataProjection: props.projection }));
};

function drawend(event: DrawEvent) {
    const geoJSON = geoJSONFormat.writeGeometry(event.feature.getGeometry()!, {
        dataProjection: props.projection,
    });
    const wkt = wktFormat.writeFeature(event.feature, {
        dataProjection: props.projection,
    });
    drawnFeatures.value.push(event.feature);
    emit("drawend", { geoJSON, wkt });
    drawModeEnabled.value = false;
};

function clearDrawings() {
    if (drawSourceRef.value) {
        const s = drawSourceRef.value.source;
        for (const drawnFeature of drawnFeatures.value) {
            s.removeFeature(drawnFeature);
        }
    }
    drawnFeatures.value = [];
	emit("clearDrawing");
};

function clearAll() {
    processedLayers.value = [];
    if (drawSourceRef.value) {
        const s = drawSourceRef.value.source;
        for (const drawnFeature of drawnFeatures.value) {
            s.removeFeature(drawnFeature);
        }
    }
    drawnFeatures.value = [];
    selectedFeatures.value = [];
    escapeOverlay(-1);
};

const clickThroughModeEnabled = ref(false);

function toggleClickThroughMode() {
    clickThroughModeEnabled.value = !clickThroughModeEnabled.value;
}

const processedLayers = ref<MapFeatureCollection[]>([]);
const wktFormat = new WKT();
const geoJSONFormat = new GeoJSON();

function processLayers(newLayers: DataFeatureCollection[]) {
    const newProcessedLayers: MapFeatureCollection[] = [];
    for (const layer of newLayers) {
        // check all features for WKT geometry and translate it to GeoJSON
        const geoJSONFeatures: MapFeature[] = [];
        for (const feature of layer.features) {
            const geoJSONFeature: MapFeature = feature.geoJSON
                ? geoJSONFormat.readFeature(feature.geoJSON, { dataProjection: props.projection }) as MapFeature
                : wktFormat.readFeature(feature.wkt, { dataProjection: props.projection });
            geoJSONFeature.setProperties(feature.properties);
            geoJSONFeature.setId(feature.id);
            geoJSONFeatures.push(geoJSONFeature);
        }
        // sort the features by area large to small, which makes clicking around easier for overlapping areas
        geoJSONFeatures.sort((a, b) => {
            const areaA = getArea(a.getGeometry()!);
            const areaB = getArea(b.getGeometry()!);
            return areaB - areaA;
        });

        newProcessedLayers.push({
            ...layer,
            features: geoJSONFeatures,
        });
    }
    processedLayers.value = newProcessedLayers;
};

function fitToExtent(extent: Extent) {
    if (viewRef.value && extent && extent[0] !== Infinity) {
        viewRef.value.view.fit(extent, {
            maxZoom: 20,
            padding: [32, 32, 32, 32],
            duration: props.animationDuration,
        });
    }
};

// Fits the view to the extent of the last added layer
function fitToLayerExtent() {
    setTimeout(() => {
        const layersArray = layerSourcesRef.value;
        if (layersArray?.length) {
            const extent = layersArray[layersArray.length - 1].source.getExtent();
            fitToExtent(extent);
        }
    }, 0);
};

watch(() => props.layers, (newVal: DataFeatureCollection[]) => {
    processLayers(newVal);
    if (props.fitAddedLayersToExtent) {
        fitToLayerExtent();
    }
    if (props.clearDrawingsOnLayerChange) {
        clearDrawings();
    }
    escapeOverlay(-1);
}, { deep: true });

// this ensures that when the tooltip for an underlying feature is clicked, the feature is brought to the foreground of the map
function overrideStyleFunction(feature: FeatureLike, currentStyle: Style) {
    if (feature.getProperties().iri && feature.getProperties().iri === selectedFeature.value?.getProperties().iri) {
        return new Style({
            fill: currentStyle.getFill() || undefined,
            stroke: currentStyle.getStroke() || undefined,
            image: currentStyle.getImage() || undefined,
            // geometryFunction: currentStyle.geometryFunction_,
            zIndex: 1,
        });
    }
    return currentStyle;
}

function layersOverrideStyleFunction(feature: FeatureLike, currentStyle: Style, layer: any) {
    if (typeof props.layersOverrideStyleFunction === "function") {
        const newStyle = props.layersOverrideStyleFunction(
            feature,
            currentStyle,
            layer,
        );
        if (newStyle instanceof Style) {
            return newStyle;
        }
        return new Style(newStyle);
    }
    return currentStyle;
}

function resetExtent() {
	viewRef.value?.setCenter([133.7751, -25.2744])
	viewRef.value?.setZoom(4)
}

onMounted(() => {
    processLayers(props.layers);
    if (props.fitAddedLayersToExtent) {
        fitToLayerExtent();
    }
});
</script>

<template>
    <div :class="cn('h-full flex flex-col', props.class)">
        <OlMap
            ref="mapRef"
            :loadTilesWhileAnimating="true"
            :loadTilesWhileInteracting="true"
            style="height: 100%; width: 100%; min-height: 400px; position: relative;"
        >
            <OlView
                ref="viewRef"
                :projection="props.projection"
                :center="props.center"
                :rotation="props.rotation"
                :zoom="props.zoom"
            />

            <!-- base maps -->
            <OlTileLayer title="OpenStreetMap" :visible="true" :displayInLayerSwitcher="false">
                <OlSourceOSM />
            </OlTileLayer>

            <slot name="tiles" />

            <OlVectorLayer :displayInLayerSwitcher="false">
                <OlSourceVector :projection="props.projection" ref="drawSourceRef">
                    <OlInteractionDraw v-if="drawModeEnabled" :type="drawType" @drawend="drawend" @drawstart="drawstart">
                        <OlStyle>
                            <OlStyleStroke color="blue" :width="2"></OlStyleStroke>
                            <OlStyleFill color="rgba(255, 255, 0, 0.4)"></OlStyleFill>
                            <OlStyleCircle :radius="5">
                                <OlStyleFill color="#00dd11" />
                                <OlStyleStroke color="blue" :width="2" />
                            </OlStyleCircle>
                        </OlStyle>
                    </OlInteractionDraw>
                </OlSourceVector>
            </OlVectorLayer>

            <slot name="bottom-layers" />

            <!-- layers -->
            <OlVectorLayer v-for="layer in processedLayers" :title="layer.title" :visible="true" ref="layersRef">
                <OlSourceVector :features="layer.features" :strategy="bbox" ref="layerSourcesRef"></OlSourceVector>
                <OlStyle :overrideStyleFunction="(feature, currentStyle) => layersOverrideStyleFunction(feature, currentStyle, layer)">
                    <OlStyleStroke :color="layer.style?.strokeColor || drawStyle.strokeColor" :width="layer.style?.strokeWidth || drawStyle.strokeWidth"></OlStyleStroke>
                    <OlStyleFill :color="layer.style?.fillColor || drawStyle.fillColor"></OlStyleFill>
                    <OlStyleCircle :radius="layer.style?.radius || drawStyle.radius">
                        <OlStyleFill :color="layer.style?.circleColor || drawStyle.circleColor"></OlStyleFill>
                    </OlStyleCircle>
                </OlStyle>
            </OlVectorLayer>

            <slot name="top-layers" />

            <OlInteractionSelect :condition="click" @select="featureClick" ref="clickSelectRef">
                <OlStyle :overrideStyleFunction="overrideStyleFunction">
                    <OlStyleStroke color="blue" :width="2"></OlStyleStroke>
                    <OlStyleFill color="rgba(0, 190, 110, 0.4)"></OlStyleFill>
                    <OlStyleCircle :radius="5">
                        <OlStyleFill color="#00dd11" />
                        <OlStyleStroke color="blue" :width="2" />
                    </OlStyleCircle>
                </OlStyle>
            </OlInteractionSelect>

            <OlInteractionMouseWheelZoom :condition="platformModifierKeyOnly" />

            <slot name="interactions" />

            <!-- <OlLayerSwitcherControl /> -->
            <OlFullScreenControl />
            <OlScaleLineControl />
            <OlZoomSliderControl />
	        <MapButton variant="outline" size="icon" class="left-2 top-17" tooltip="Reset map view" tooltipSide="right" @click="resetExtent"><View class="size-4.5" /></MapButton>

	        <ButtonGroup v-if="props.enableToolbar" class="z-[1] absolute left-1/2 -translate-x-1/2 top-2">
		        <template v-if="props.enableDrawing">
			        <MapButton
				        size="icon"
				        variant="outline"
				        :active="drawModeEnabled"
				        class="relative"
				        tooltip="Draw an area on the map"
				        tooltipSide="bottom"
				        @click="toggleDrawMode"
			        >
				        <Pentagon class="size-4" />
			        </MapButton>
<!--			        <ButtonGroupSeparator />-->
			        <MapButton
				        size="icon"
				        variant="outline"
				        class="relative"
				        tooltip="Clear all drawn features from the map"
				        tooltipSide="bottom"
				        @click="clearDrawings"
			        >
				        <Eraser class="size-4" />
			        </MapButton>
<!--			        <ButtonGroupSeparator />-->
		        </template>
		        <MapButton
			        size="icon"
			        variant="outline"
			        :active="clickThroughModeEnabled"
			        class="relative"
			        :tooltip="clickThroughModeEnabled ? 'Disable to only select top feature on click' : 'Enable to select all overlapping features on click'"
			        tooltipSide="bottom"
			        @click="toggleClickThroughMode"
		        >
			        <ChevronsDown class="size-4" />
		        </MapButton>
		        <template v-if="enableClearFeatures">
<!--			        <ButtonGroupSeparator />-->
			        <MapButton
				        size="icon"
				        variant="outline"
				        class="relative"
				        tooltip="Clear all features from the map"
				        tooltipSide="bottom"
				        @click="clearAll"
			        >
				        <Trash class="size-4" />
			        </MapButton>
		        </template>
	        </ButtonGroup>

<!--	        <Collapsible v-if="props.enableToolbar" class="flex flex-col gap-3 z-[1] absolute right-2 top-24" v-slot="{open}">-->
<!--		        <CollapsibleTrigger>-->
<!--			        <MapButton-->
<!--				        size="icon"-->
<!--				        variant="secondary"-->
<!--				        :active="open"-->
<!--				        class="relative"-->
<!--				        :tooltip="open ? 'Collapse drawing tools' : 'Expand drawing tools'"-->
<!--				        tooltipSide="left"-->
<!--			        >-->
<!--				        <PencilRuler class="size-4" />-->
<!--			        </MapButton>-->
<!--		        </CollapsibleTrigger>-->
<!--		        <CollapsibleContent class="flex flex-col gap-3 transition-all">-->
<!--			        <template v-if="props.enableDrawing">-->
<!--				        <MapButton-->
<!--					        size="icon"-->
<!--					        variant="secondary"-->
<!--					        :active="drawModeEnabled"-->
<!--					        class="relative"-->
<!--					        tooltip="Draw an area on the map"-->
<!--					        tooltipSide="left"-->
<!--					        @click="toggleDrawMode"-->
<!--				        >-->
<!--					        <Pentagon class="size-4" />-->
<!--				        </MapButton>-->
<!--				        <MapButton-->
<!--					        size="icon"-->
<!--					        variant="secondary"-->
<!--					        class="relative"-->
<!--					        tooltip="Clear all drawn features from the map"-->
<!--					        tooltipSide="left"-->
<!--					        @click="clearDrawings"-->
<!--				        >-->
<!--					        <Eraser class="size-4" />-->
<!--				        </MapButton>-->
<!--			        </template>-->
<!--			        <MapButton-->
<!--				        size="icon"-->
<!--				        variant="secondary"-->
<!--				        :active="clickThroughModeEnabled"-->
<!--				        class="relative"-->
<!--				        :tooltip="clickThroughModeEnabled ? 'Disable to only select top feature on click' : 'Enable to select all overlapping features on click'"-->
<!--				        tooltipSide="left"-->
<!--				        @click="toggleClickThroughMode"-->
<!--			        >-->
<!--				        <ChevronsDown class="size-4" />-->
<!--			        </MapButton>-->
<!--			        <MapButton-->
<!--				        v-if="enableClearFeatures"-->
<!--				        size="icon"-->
<!--				        variant="secondary"-->
<!--				        class="relative"-->
<!--				        tooltip="Clear all features from the map"-->
<!--				        tooltipSide="left"-->
<!--				        @click="clearAll"-->
<!--			        >-->
<!--				        <Trash class="size-4" />-->
<!--			        </MapButton>-->
<!--		        </CollapsibleContent>-->
<!--	        </Collapsible>-->

<!--            <div v-if="props.enableToolbar" class="z-[1] ol-unselectable ol-control ol-bar ol-group flex flex-row !absolute !left-1/2 !top-2 !transform-[translate(-50%,0)]">-->
<!--                <template v-if="props.enableDrawing">-->
<!--                    &lt;!&ndash; &#9645; &ndash;&gt;-->
<!--                    &lt;!&ndash; &#9675; &ndash;&gt;-->
<!--                    <button-->
<!--                        type="button"-->
<!--                        name="drawButton"-->
<!--                        :class="`${drawModeEnabled ? 'active' : ''}`"-->
<!--                        title="Draw an area on the map"-->
<!--                        @click="toggleDrawMode"-->
<!--                    >-->
<!--                        <Pentagon class="size-4" />-->
<!--                    </button>-->
<!--                    <button-->
<!--                        type="button"-->
<!--                        class=""-->
<!--                        name="clearDrawingsButton"-->
<!--                        title="Clear all drawn features from the map"-->
<!--                        @click="clearDrawings"-->
<!--                    >-->
<!--                        <Delete class="size-4" />-->
<!--                    </button>-->
<!--                </template>-->
<!--                <button-->
<!--                    type="button"-->
<!--                    :class="`!pb-1 ${clickThroughModeEnabled ? 'active' : ''}`"-->
<!--                    name="clickThroughButton"-->
<!--                    :title="clickThroughModeEnabled ? 'Disable to only select top feature on click' : 'Enable to select all overlapping features on click'"-->
<!--                    @click="toggleClickThroughMode"-->
<!--                >-->
<!--                    &DoubleDownArrow;-->
<!--                </button>-->
<!--                <button-->
<!--                    v-if="enableClearFeatures"-->
<!--                    class=""-->
<!--                    type="button"-->
<!--                    name="clearButton"-->
<!--                    title="Clear all features from the map"-->
<!--                    @click="clearAll"-->
<!--                >-->
<!--                    <Trash class="size-4" />-->
<!--                </button>-->
<!--            </div>-->

            <slot name="controls" />

            <!-- <OlOverlay v-if="props.loading" :position="center" positioning="center-center">
                <div class="overlay-content loading">Loading...</div>
            </OlOverlay> -->

            <div v-if="props.loading" class="bg-background rounded p-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-row items-center gap-4">
                <LoaderCircle class="animate-spin" />
                <span>Loading...</span>
            </div>

            <template v-if="clickThroughModeEnabled && selectedFeatures && selectedFeatures.length">
                <OlOverlay
                    v-for="(clickedFeature, index) in selectedFeatures"
                    :position="getFeatureCenter(clickedFeature)"
                    positioning="bottom-center"
                    :stopEvent="true"
                >
                    <MapTooltipTemp :selectedFeature="clickedFeature" :queryString="props.tooltipIriQueryString" @select="selectFeature" @deselect="escapeOverlay(index)" />
                </OlOverlay>
            </template>
            <OlOverlay v-else-if="selectedFeature && selectedFeature.getProperties().name" :position="selectedPosition || center" positioning="bottom-center" :stopEvent="true">
                <MapTooltip :selectedFeature="selectedFeature" @select="selectFeature" @deselect="escapeOverlay(-1)" />
            </OlOverlay>

            <slot name="overlays" />
        </OlMap>
        <span class="text-xs text-muted-foreground px-2">{{ modifierKeySymbol }} + scroll wheel to zoom</span>
    </div>
</template>

<style scoped>
.ol-bar.ol-control button:first-child {
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
}

.ol-bar.ol-control button:last-child {
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
}

.ol-bar.ol-control button {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition-property: color, background-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
}

.ol-bar.ol-control button:hover {
    background-color: var(--color-accent);
    color: var(--color-accent-foreground);
    outline: none;
}

.ol-bar.ol-control button.active {
    background-color: var(--color-primary);
    color: var(--color-primary-foreground);
}
</style>
