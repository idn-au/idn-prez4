<script setup lang="ts">
const { globalProfiles } = useGlobalProfiles();

const urlPath = ref("/catalogs");
const apiEndpoint = useGetPrezAPIEndpoint();
const currentProfile = computed(() => data.value ? data.value.profiles.find(p => p.current) : undefined);
const { status, error, data } = useGetList(apiEndpoint, urlPath);
</script>

<template>
	<ItemList v-if="globalProfiles && currentProfile" :fields="globalProfiles?.[currentProfile?.uri || '']" :list="data.data" :key="urlPath" />
	<Loading v-else />
</template>

<style scoped>

</style>