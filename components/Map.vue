<script lang="ts" setup>
import { type HTMLAttributes } from "vue";
import { Trash, Delete, Pentagon, LoaderCircle } from "lucide-vue-next";
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

type MapStyle = {
    strokeWidth: number;
    strokeColor: string;
    fillColor: string;
    radius: number;
    circleColor: string;
    circleStrokeWidth: number;
    circleStrokeColor: string;
};

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
    layers?: any[];
    loading?: boolean;
    clearDrawingsOnLayerChange?: boolean;
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
    loading: false,
    clearDrawingsOnLayerChange: false,
    fitAddedLayersToExtent: false,
    enableToolbar: false,
    enableDrawing: false,
    enableClearFeatures: false,
});

const emit = defineEmits<{
    drawstart: [geometry: string];
    drawend: [geometry: { geoJSON: string; wkt: string; }];
    select: [feature: Feature<Geometry>];
    // hover: [];
}>();

defineExpose({
    escapeOverlay,
    selectFeatureByIRI,
    // fitToExtent,
});

const mapRef = useTemplateRef("mapRef");
const viewRef = useTemplateRef("viewRef");
const layersRef = useTemplateRef("layersRef");
const layerSourcesRef = useTemplateRef("layerSourcesRef");
const clickSelectRef = useTemplateRef("clickSelectRef");
const drawSourceRef = useTemplateRef("drawSourceRef");

const options: Vue3OpenlayersGlobalOptions = {
    debug: false,
};

provide("ol-options", options);

const modifierKeySymbol = import.meta.client && navigator.platform.startsWith("Mac") ? "⌘" : "ctrl";

const selectedFeature = ref<Feature<Geometry> | undefined>(undefined);
const selectedFeatures = ref<Feature<Geometry>[]>([]);
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

function selectFeature(feature: Feature<Geometry>, fitToFeatureExtent: boolean) {
    selectedFeatures.value = [];
    selectedFeature.value = feature;
    let selection = getFeatureCenter(feature);
    selectedPosition.value = selection;
    if (clickSelectRef.value) {
        clickSelectRef.value.select.getFeatures().clear();
        clickSelectRef.value.select.getFeatures().push(feature);
    }
    if (fitToFeatureExtent && feature.getGeometry()) {
        const extent = feature.getGeometry()!.getExtent();
        fitToExtent(extent);
    }
    if (selectedFeature.name) {
        emit("select", selectedFeature.value);
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
        let clickLocation = e.mapBrowserEvent.pixel;

        let overlappingFeatures: any[] = [];
        if (mapRef.value) {
            mapRef.value.forEachFeatureAtPixel(
                clickLocation,
                function (feature: FeatureLike) {
                    if (feature.name) {
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
    if (selectedFeature.value?.name) {
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
        let s = drawSourceRef.value.source;
        for (const drawnFeature of drawnFeatures.value) {
            s.removeFeature(drawnFeature);
        }
    }
    drawnFeatures.value = [];
};

function clearAll() {
    processedLayers.value = [];
    if (drawSourceRef.value) {
        let s = drawSourceRef.value.source;
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

const processedLayers = ref<any[]>([]);
const wktFormat = new WKT();
const geoJSONFormat = new GeoJSON();

function processLayers(newLayers: any[]) {
    let newProcessedLayers = [];
    for (const layer of newLayers) {
        // check all features for WKT geometry and translate it to GeoJSON
        const features = layer.features;
        const geoJSONFeatures = [];
        for (const feature of features) {
            let geoJSONFeature: any = {};
            if (feature.geoJSON) {
                geoJSONFeature = geoJSONFormat.readFeature(feature.geoJSON, { dataProjection: props.projection });
            } else if (feature.wkt) {
                geoJSONFeature = wktFormat.readFeature(feature.wkt, { dataProjection: props.projection });
            }
            geoJSONFeature.name = feature.name;
            geoJSONFeature.data = feature.data;
            geoJSONFeature.setId(feature.id);
            geoJSONFeatures.push(geoJSONFeature);
        }
        // sort the features by area large to small, which makes clicking around easier for overlapping areas
        layer.geoJSONFeatures = geoJSONFeatures.sort((a, b) => {
            let extentA = a.getGeometry();
            let extentB = b.getGeometry();
            let areaA = getArea(extentA);
            let areaB = getArea(extentB);
            return areaB - areaA;
        });

        newProcessedLayers.push(layer);
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

watch(() => props.layers, (newVal: any) => {
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
    if (feature.data?.iri && feature.data?.iri === selectedFeature.value?.data?.iri) {
        return new Style({
            fill: currentStyle.fill_,
            stroke: currentStyle.stroke_,
            image: currentStyle.image_,
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
            style="height: 100%; width: 100%; min-height: 400px; min-width: 400px; position: relative;"
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
                <OlSourceVector :features="layer.geoJSONFeatures" :strategy="bbox" ref="layerSourcesRef"></OlSourceVector>
                <OlStyle :overrideStyleFunction="(feature, currentStyle) => layersOverrideStyleFunction(feature, currentStyle, layer)">
                    <OlStyleStroke :color="layer.strokeColor || drawStyle.strokeColor" :width="layer.strokeWidth || drawStyle.strokeWidth"></OlStyleStroke>
                    <OlStyleFill :color="layer.fillColor || drawStyle.fillColor"></OlStyleFill>
                    <OlStyleCircle :radius="layer.radius || drawStyle.radius">
                        <OlStyleFill :color="layer.circleColor || drawStyle.circleColor"></OlStyleFill>
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

            <div v-if="props.enableToolbar" class="z-[1] ol-unselectable ol-control ol-bar ol-group flex flex-row !absolute !left-1/2 !top-2 !-translate-x-1/2">
                <template v-if="props.enableDrawing">
                    <!-- &#9645; -->
                    <!-- &#9675; -->
                    <button
                        type="button"
                        name="drawButton"
                        :class="`!flex !items-center !justify-center ${drawModeEnabled ? 'active' : ''}`"
                        title="Draw an area on the map"
                        @click="toggleDrawMode"
                    >
                        <Pentagon class="size-4" />
                    </button>
                    <button
                        type="button"
                        class="!flex !items-center !justify-center"
                        name="clearDrawingsButton"
                        title="Clear all drawn features from the map"
                        @click="clearDrawings"
                    >
                        <Delete class="size-4" />
                    </button>
                </template>
                <button
                    type="button"
                    :class="`!pb-1 ${clickThroughModeEnabled ? 'active' : ''}`"
                    name="clickThroughButton"
                    :title="clickThroughModeEnabled ? 'Disable to only select top feature on click' : 'Enable to select all overlapping features on click'"
                    @click="toggleClickThroughMode"
                >
                    &DoubleDownArrow;
                </button>
                <button
                    v-if="enableClearFeatures"
                    class="!flex !items-center !justify-center"
                    type="button"
                    name="clearButton"
                    title="Clear all features from the map"
                    @click="clearAll"
                >
                    <Trash class="size-4" />
                </button>
            </div>

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
                    <MapTooltip :selectedFeature="clickedFeature" :queryString="props.tooltipIriQueryString" @select="selectFeature" @deselect="escapeOverlay(index)" />
                </OlOverlay>
            </template>
            <OlOverlay v-else-if="selectedFeature && selectedFeature.name" :position="selectedPosition || center" positioning="bottom-center" :stopEvent="true">
                <MapTooltip :selectedFeature="selectedFeature" @select="selectFeature" @deselect="escapeOverlay(-1)" />
            </OlOverlay>

            <slot name="overlays" />
        </OlMap>
        <span class="text-xs text-muted-foreground">{{ modifierKeySymbol }} + scroll wheel to zoom</span>
    </div>
</template>

<style scoped>
.overlay-content {
    background-color: white;
    border: 1px solid #cccccc;
    padding: 12px;
    border-radius: 0.25rem;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

button.active {
    background-color: lightgrey;
}
</style>
