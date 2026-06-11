<script setup lang="ts">
import {Clock, Globe, MapPinned, Lock} from "lucide-vue-next";
import type {Result} from "~/utils/types";

interface SearchResultProps {loading: boolean}

interface SearchResultLoading extends SearchResultProps {loading: true}

interface SearchResultData extends SearchResultProps, Result {loading: false}

const props = withDefaults(defineProps<SearchResultLoading | SearchResultData>(), {
	loading: false,
});

const emit = defineEmits<{
	mapFocus: [iri: string];
}>();

const dateObj = computed(() => props.created ? new Date(props.created) : undefined);
</script>

<template>
	<Item variant="outline">
		<!--						<ItemMedia>x</ItemMedia>-->
		<ItemContent>
			<ItemTitle class="text-lg">
				<Skeleton v-if="props.loading" class="h-7 w-60" />
				<NuxtLink v-else :to="`/object?iri=${props.iri}`">{{props.label}}</NuxtLink>
			</ItemTitle>
			<ItemDescription class="flex flex-row gap-1 flex-wrap">
				<Skeleton v-if="props.loading" v-for="_ in 3" class="h-5 w-16" />
				<template v-else>
					<Badge v-for="type in props.type">{{type}}</Badge>
					<Badge v-for="addType in props.addType" variant="secondary">{{addType}}</Badge>
				</template>
			</ItemDescription>
			<ItemDescription v-if="props.loading || props.accessRights">
				<Skeleton v-if="props.loading" class="h-5 w-40" />
				<template v-else>
					<Lock class="size-3.5 inline" />
					{{props.accessRights.join(", ")}}
				</template>
			</ItemDescription>
			<ItemDescription v-if="props.loading || props.description" class="line-clamp-3">
				<div v-if="props.loading" class="flex flex-col gap-1">
					<Skeleton class="h-5 w-full" />
					<Skeleton class="h-5 w-full" />
					<Skeleton class="h-5 w-2/3" />
				</div>
				<template v-else>{{props.description}}</template>
			</ItemDescription>
			<ItemDescription v-if="props.loading || props.created">
				<Skeleton v-if="props.loading" class="h-5 w-40" />
				<template v-else>
					<Clock class="size-3.5 inline" />
					{{props.created}}
<!--					<NuxtTime v-if="dateObj" :datetime="dateObj" year="numeric" month="long" day="numeric" />-->
				</template>
			</ItemDescription>
			<ItemDescription v-if="props.loading || props.parent">
				<Skeleton v-if="props.loading" class="h-5 w-40" />
				<template v-else>{{props.parent}}</template>
			</ItemDescription>
			<ItemDescription v-if="props.loading || props.keywords" class="flex flex-row gap-1 flex-wrap">
				<Skeleton v-if="props.loading" v-for="_ in 3" class="h-5 w-16" />
				<template v-else>
					<Badge v-for="keyword in props.keywords" variant="outline">{{keyword}}</Badge>
				</template>
			</ItemDescription>
		</ItemContent>
		<ItemActions>
			<template v-if="props.loading">
				<Skeleton class="h-9 w-19" />
				<Skeleton class="h-9 w-34.5" />
			</template>
			<template v-else>
				<Button v-if="props.url" variant="outline" class="!text-foreground" asChild>
					<a :href="props.url"><Globe /> URL</a>
				</Button>
				<Button v-if="props.geom" variant="secondary" @click="emit('mapFocus', props.iri)"><MapPinned /> Show on map</Button>
			</template>
		</ItemActions>
	</Item>
</template>
