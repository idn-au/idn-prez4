<script lang="ts" setup>
import {
	getList,
	type PrezFacet,
	type PrezFocusNode,
	type PrezLinkParent,
	type PrezProfileHeader
} from "prez-lib";

const props = defineProps<{
	membersUrl: string;
}>();

const { globalProfiles } = useGlobalProfiles();
const apiEndpoint = useGetPrezAPIEndpoint();

const page = ref(1);
const limit = ref(10);

const fullUrl = computed(() => `${props.membersUrl}?page=${page.value}&limit=${limit.value}`);

const { data, status, error } = useLazyAsyncData(fullUrl.value, () => getList(apiEndpoint, fullUrl.value), {
	default: () => ({
		type: "list",
		data: ([] as PrezFocusNode[]),
		count: 0,
		maxReached: true,
		profiles: ([] as PrezProfileHeader[]),
		parents: ([] as PrezLinkParent[]),
		facets: ([] as PrezFacet[]),
	}),
	watch: [fullUrl],
});

const currentProfile = computed(() => data.value ? data.value.profiles.find(p => p.current) : undefined);
</script>

<template>
	<div>
		<Message v-if="error" severity="error">{{ error }}</Message>
		<Loading v-else-if="status == 'pending'" variant="list" />
		<template v-else-if="data?.data && data.count > 0">
			<h3 class="font-bold text-lg mt-6 mb-3">Items within this resource</h3>
<!--			<Facets v-if="globalProfiles && currentFacetProfile && globalProfiles[currentFacetProfile]"-->
<!--			        :facets="data.facets"-->
<!--			        :profile="globalProfiles[currentFacetProfile]"-->
<!--			/>-->
			<ItemList v-if="globalProfiles && currentProfile" :fields="globalProfiles?.[currentProfile?.uri || '']" :list="data.data" :key="fullUrl" />
			<Loading v-else variant="list" />
			<StandaloneMembersPagination :totalItems="data.count" :maxReached="data.maxReached" v-model:page="page" v-model:limit="limit" />
		</template>
	</div>
</template>