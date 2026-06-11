<script setup lang="ts">
import type {HTMLAttributes} from "vue";
import type {AcceptableValue} from "reka-ui";
import {X} from "lucide-vue-next";
import {cn} from "~/lib/utils";

const props = defineProps<{
	options: Option[];
	placeholder?: string;
	multiple?: boolean;
	hideClearButton?: boolean;
	disabled?: boolean;
	class?: HTMLAttributes["class"];
}>();

const model = defineModel<AcceptableValue | AcceptableValue[]>();
</script>

<template>
	<Select v-model="model" :multiple="props.multiple" :disabled="props.disabled">
		<div :class="cn('relative w-full items-center', props.class)">
			<SelectTrigger :class="`w-full ${hideClearButton ? '' : '!pr-10'}`">
				<SelectValue :placeholder="props.placeholder || 'Select an option'" />
			</SelectTrigger>
			<span v-if="!hideClearButton" class="absolute end-0 inset-y-0 flex items-center justify-center">
                <Button variant="link" size="icon-sm" class="text-muted-foreground hover:text-foreground" :disabled="props.disabled" @click="model = props.multiple ? [] : ''"><X /></Button>
            </span>
		</div>
		<SelectContent>
			<SelectGroup>
				<SelectItem v-for="option in props.options" :value="option.value">
					{{option.label || option.value}}
				</SelectItem>
			</SelectGroup>
		</SelectContent>
	</Select>
</template>
