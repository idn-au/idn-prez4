<script setup lang="ts">
import {Search, X, ChevronDown, MapPin} from "lucide-vue-next";
import ConceptSelect from "./ConceptSelect.vue";
import FormSelect from "./FormSelect.vue";

const typeOptions: Option[] = [
	{
		label: "Creative Work",
		value: "https://schema.org/CreativeWork",
	},
	{
		label: "Dataset",
		value: "https://schema.org/Dataset",
	},
	{
		label: "Concept Scheme",
		value: "http://www.w3.org/2004/02/skos/core#ConceptScheme",
	},
	{
		label: "Concept",
		value: "http://www.w3.org/2004/02/skos/core#Concept",
	},
	{
		label: "Feature Collection",
		value: "http://www.opengis.net/ont/geosparql#FeatureCollection",
	},
	{
		label: "Feature",
		value: "http://www.opengis.net/ont/geosparql#Feature",
	},
];

const model = defineModel();

const showAdvancedSearch = ref(false);

const emit = defineEmits<{
	submit: [];
}>();
</script>

<template>
	<div class="border rounded-lg p-6 max-w-[1000px] mx-auto flex flex-col gap-4">
		<InputGroup class="h-10">
			<InputGroupAddon>
				<Search class="size-5" />
			</InputGroupAddon>
			<InputGroupInput type="search" autofocus name="q" v-model="model.q" placeholder="Search..." class="!text-base" @keyup.enter="emit('submit')" />
			<InputGroupAddon align="inline-end">
				<InputGroupButton type="button" size="icon-sm" variant="link" class="text-muted-foreground hover:text-foreground" @click="model.q = ''">
					<X class="size-5" />
				</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
		<div :class="`grid grid-cols-2 gap-4 overflow-hidden transition-[height] ${showAdvancedSearch ? '' : 'h-0'}`">
			<Field class="gap-1">
				<FieldLabel>Type</FieldLabel>
				<FormSelect v-model="model.type" :options="typeOptions" placeholder="Select a type" multiple />
				<FieldDescription>RDF classes</FieldDescription>
			</Field>
			<Field class="gap-1">
				<FieldLabel>Additional Type</FieldLabel>
				<ConceptSelect v-model="model.additionalType" vocabIRI="https://data.idnau.org/pid/vocab/cat-obj-types" multiple />
				<FieldDescription>Catalogue resource types</FieldDescription>
			</Field>
			<Field class="gap-1">
				<FieldLabel>Keywords</FieldLabel>
				<ConceptSelect v-model="model.keywords" vocabIRI="https://data.idnau.org/pid/vocab/idn-th" multiple />
				<FieldDescription>Tags/themes</FieldDescription>
			</Field>
			<Field class="gap-1">
				<FieldLabel>Language</FieldLabel>
				<ConceptSelect v-model="model.language" vocabIRI="https://data.idnau.org/pid/austlang" multiple />
				<FieldDescription>Indigenous languages (may be slow to load)</FieldDescription>
			</Field>
			<Field class="gap-1">
				<FieldLabel>Access Rights</FieldLabel>
				<ConceptSelect v-model="model.accessRights" vocabIRI="https://linked.data.gov.au/def/data-access-rights" multiple />
				<FieldDescription>Restrictions to access the data</FieldDescription>
			</Field>
<!--			<Field class="gap-1">-->
<!--				<div class="grid grid-cols-2 gap-2">-->
<!--					<Field>-->
<!--						<FieldLabel>From</FieldLabel>-->
<!--						<Input type="date" v-model="model.from" />-->
<!--					</Field>-->
<!--					<Field>-->
<!--						<FieldLabel>To</FieldLabel>-->
<!--						<Input type="date" v-model="model.to" />-->
<!--					</Field>-->
<!--				</div>-->
<!--				<FieldDescription>desc</FieldDescription>-->
<!--			</Field>-->
			<Field class="gap-1">
				<FieldLabel>Location</FieldLabel>
				<InputGroup>
					<InputGroupAddon>
						<MapPin class="size-4" />
					</InputGroupAddon>
<!--					<InputGroupInput type="search" v-model="model.location" placeholder="Search a location..." disabled />-->
					<InputGroupInput type="text" v-model="model.within" placeholder="Select an area..." disabled />
					<InputGroupAddon align="inline-end">
						<InputGroupButton type="button" size="icon-sm" variant="link" class="text-muted-foreground hover:text-foreground" @click="model.within = ''">
							<X class="size-4" />
						</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>
<!--				<FieldDescription>GeoNames search</FieldDescription>-->
				<FieldDescription>Draw on the map to search within an area</FieldDescription>
			</Field>
<!--			<Field class="gap-1">-->
<!--				<FieldLabel>Parent</FieldLabel>-->
<!--				<FormSelect v-model="model.parent" :options="[]" placeholder="Select a parent resource" multiple disabled />-->
<!--				<FieldDescription>Will be a tree select?</FieldDescription>-->
<!--			</Field>-->
		</div>
		<div class="flex flex-row justify-between items-end">
			<Button variant="outline" @click="showAdvancedSearch = !showAdvancedSearch">
				<ChevronDown :class="`size-4 transition-transform ${showAdvancedSearch ? 'rotate-180' : ''}`" />
				Advanced Search
			</Button>
			<Button size="lg" @click="emit('submit')">
				<Search class="size-5" />
				Search
			</Button>
		</div>
	</div>
</template>

<style scoped>

</style>