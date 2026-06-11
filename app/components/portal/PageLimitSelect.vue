<script setup lang="ts">
import FormSelect from "~/components/portal/FormSelect.vue";

const limit = defineModel<number>({ default: 10 });

const options = [
	{value: 5},
	{value: 10},
	{value: 20},
	{value: 50},
	{value: 100},
];
</script>

<template>
	<Field class="w-20 gap-1">
		<FieldLabel class="text-muted-foreground">Per page</FieldLabel>
		<FormSelect v-model="limit" :options="options" placeholder="Per page" hideClearButton />
	</Field>
</template>
