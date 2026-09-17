<script lang="ts" setup>
const limitOptions = [5, 10, 20, 50, 100];

const limit = defineModel<number>({default: 10});
</script>

<template>
	<div class="flex flex-row items-center justify-center gap-1 text-sm">
		Per page
		<Select v-model="limit">
			<SelectTrigger class="w-20">
				<SelectValue placeholder="Per page" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem v-for="option in limitOptions" :value="option">
						{{ option }}
					</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	</div>
</template>