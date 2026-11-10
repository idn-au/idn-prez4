<script lang="ts" setup>
import {
	getList,
	type PrezFacet,
	type PrezFocusNode,
	type PrezLinkParent,
	type PrezProfileHeader
} from "prez-lib";
import { Search, X } from "@lucide/vue";

const props = defineProps<{
	membersUrl: string;
}>();

const { globalProfiles } = useGlobalProfiles();
const apiEndpoint = useGetPrezAPIEndpoint();

const page = ref(1);
const limit = ref(100);
const filter = ref("");
const q = ref("");
const sortBy = ref<"label" | string>("label");
const sortByDirection = ref<"ASC" | "DESC">("ASC");

const fullUrl = computed(() => {
    let url = `${props.membersUrl}?page=${page.value}&limit=${limit.value}&facet_profile=idn-facet`;

    if (filter.value !== "") {
        url += `&filter=${filter.value}`;
    }

    if (sortBy.value !== "label") {
        url += `order_by=${sortBy.value}&order_by_direction=${sortByDirection.value}`;
    }

    return url;
});

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
const filteredMembers = computed(() => {
    let sorted = data.value?.data.filter(n => (n.label?.value || n.value).toLowerCase().includes(q.value.toLowerCase())) || [];
	if (sortBy.value === "label") {
		sorted = data.value.data.toSorted(sortNodesByLabel);
	} else {
		sorted = data.value.data.toSorted((a, b) => {
			if (a.properties && sortBy.value in a.properties && b.properties && sortBy.value in b.properties) {
				if (a.properties[sortBy.value].objects.every(o => o.termType === "NamedNode") && b.properties[sortBy.value].objects.every(o => o.termType === "NamedNode")) {
					(a.properties[sortBy.value].objects as PrezNode[]).sort(sortNodesByLabel);
					(b.properties[sortBy.value].objects as PrezNode[]).sort(sortNodesByLabel);
					return sortNodesByLabel(a.properties[sortBy.value].objects[0] as PrezNode, b.properties[sortBy.value].objects[0] as PrezNode);
				} else {
					a.properties[sortBy.value].objects.sort((ao, bo) => ao.value.localeCompare(bo.value));
					b.properties[sortBy.value].objects.sort((ao, bo) => ao.value.localeCompare(bo.value));
					return a.properties[sortBy.value].objects[0].value.localeCompare(b.properties[sortBy.value].objects[0].value);
				}
			} else if (a.properties && sortBy.value in a.properties) {
				return -1;
			} else if (b.properties && sortBy.value in b.properties) {
				return 1;
			} else {
				return a.value.localeCompare(b.value);
			}
		});
	}
	if (sortByDirection.value === "DESC") {
		sorted.reverse();
	}
	return sorted;
});
</script>

<template>
	<div>
		<Message v-if="error" severity="error">{{ error }}</Message>
		<Loading v-else-if="status == 'pending'" variant="list" />
		<template v-else-if="data?.data && data.count > 0">
			<h3 class="font-bold text-lg mt-6 mb-3">Items within this resource</h3>
			<InputGroup class="max-w-xs">
				<InputGroupAddon>
					<Search class="size-4" />
				</InputGroupAddon>
				<InputGroupInput v-model="q" placeholder="Search..." />
				<InputGroupAddon align="inline-end">
					<InputGroupButton type="button" size="icon-sm" variant="link" class="text-muted-foreground hover:text-foreground" @click="q = ''">
						<X class="size-4" />
					</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>
			<StandaloneMembersFacets v-if="globalProfiles && globalProfiles['idn-facet']"
		        :facets="data.facets"
		        :profile="globalProfiles['idn-facet']"
				:filter="filter"
				@change="filter = $event"
			/>
			<StandaloneItemList
    			v-if="globalProfiles && currentProfile"
                v-model:sortBy="sortBy"
                v-model:sortByDirection="sortByDirection"
    			:fields="globalProfiles?.[currentProfile?.uri || '']"
    			:list="filteredMembers"
    			:key="fullUrl + q + sortBy + sortByDirection"
			/>
			<Loading v-else variant="list" />
			<StandaloneMembersPagination :totalItems="data.count" :maxReached="data.maxReached" v-model:page="page" v-model:limit="limit" />
		</template>
	</div>
</template>
