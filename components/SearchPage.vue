<script lang="ts" setup>
import { Search, Pentagon } from "lucide-vue-next";

const appConfig = useAppConfig();
const { globalProfiles } = useGlobalProfiles();

const apiEndpoint = useGetPrezAPIEndpoint();
const { getPageUrl, pagination, formSubmitToNavigate } = usePageInfo();
const route = useRoute();
const router = useRouter();
const urlPath = ref(getPageUrl());
const currentFacetProfile = route.query.facet_profile?.toString() || undefined;

const { status, error, data } = useSearch(apiEndpoint, urlPath);

const q = ref((route.query.q || '').toString());
const tab = ref(route.hash && route.hash === "#map" ? "map" : "text");

// when a new page is navigated to
watch(() => route.fullPath, () => {
    urlPath.value = getPageUrl();
});

watch(tab, (newValue) => {
    if (newValue === "map") {
        const { query, ...r } = route;
        router.replace({
            ...r,
            hash: "#map"
        });
    } else {
        const { hash, ...r } = route;
        router.replace({
            ...r
        });
    }
});

const inSearchMode = computed(() => (route.query?.q || '').length > 0);

function enableFacets() {
    router.replace({
        ...route,
        query: {
            ...route.query,
            facet_profile: "idn-facet"
        }
    });
}

function disableFacets() {
    const { facet_profile, ...query } = route.query;
    router.replace({
        ...route,
        query
    });
}
</script>

<template>
    <NuxtLayout contentonly>
        <template #default>
            <div>
                <Tabs v-model="tab">
                    <TabsList class="grid grid-cols-2 max-w-2xl mx-auto">
                        <TabsTrigger value="text" class="data-[state=active]:bg-[background]">Text Search</TabsTrigger>
                        <TabsTrigger value="map" class="data-[state=active]:bg-[background]">Map Search</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text">
                        <div class="mx-auto max-w-4xl">
                            <h1 class="text-2xl mt-8 mb-4 text-center">Search</h1>
                            <div class="flex items-center justify-center">
                                <div class="flex-grow max-w-lg p-4">
                                    <form method="get" @submit="formSubmitToNavigate">
                                        <div class="flex flex-row">
                                            <Input type="search" autofocus autocomplete="false" name="q" v-model="q" placeholder="Enter keywords..." class="rounded-r-none" />
                                            <Button type="submit" class="rounded-l-none h-auto"><Search class="w-4 h-4" /></Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <template v-if="inSearchMode">
                                <Button v-if="!!route.query.facet_profile" variant="outline" @click="disableFacets">Disable facets</Button>
                                <Button v-else variant="outline" @click="enableFacets">Enable facets</Button>
                            </template>
                            <Loading v-if="status == 'pending'" variant="search" />
                            <div v-if="status == 'success' && data?.count == 0 && inSearchMode" class="w-full pl-4 text-sm text-muted-foreground">
                                No results found
                            </div>
                        </div>
                        <div class="flex justify-center mt-4 mb-12">
                            <div class="max-w-4xl w-full">
                                <div v-if="error"><Message severity="error">{{ error }}</Message></div>
                                <div v-if="data">
                                    <div v-if="data" :key="urlPath">
                                        <Facets v-if="globalProfiles && currentFacetProfile && globalProfiles[currentFacetProfile]" 
                                            :facets="data.facets" 
                                            :profile="globalProfiles[currentFacetProfile]" 
                                        />
                                        <SearchResults :results="data.data" />
                                        <PrezPagination
                                            v-if="status == 'success' && data?.count > 0 && inSearchMode"
                                            :totalItems="pagination.page > 1 && data.count <= pagination.limit ? data.count + pagination.limit * (pagination.page - 1) : data.count"
                                            :pagination="pagination"
                                            :maxReached="data.maxReached"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="map">
                        <div class="mx-auto max-w-4xl">
                            <div class="mb-8">
                                <h1 class="text-2xl mt-8 mb-4 text-center">Map Search</h1>
                                <p class="inline">
                                    You can search on the map by drawing a polygon by selecting the <Pentagon class="size-4 mx-1 inline" /> tool on the map, which will search items that are within it.
                                </p>
                            </div>
                            <MapSearch />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </template>
    </NuxtLayout>    
</template>