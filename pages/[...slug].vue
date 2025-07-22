<template>
    <NuxtLayout v-if="isLoading" contentonly>
        <template #default>
            <div />
        </template>
    </NuxtLayout>
    <ItemPageWrapper v-else-if="matchResult.isObjectMatch" />
    <ListPage v-else-if="matchResult.isListingMatch">
        <template v-if="route.path === '/catalogs'" #top>
            <p>
                These catalogues contain Indigenous data and reference data relevant to Indigenous data cataloging. They are managed by the <a href="https://idnau.org/" target="_blank" rel="noopener noreferrer">Indigenous Data Network (IDN)</a> on behalf of the IDN's partners.
            </p>
        </template>
    </ListPage>
    <NuxtLayout v-else contentonly>
      <template #default>
          <h1 class="text-2xl mt-8">Page not found</h1>
          <p>Sorry, this page does not exist.</p>
          <ItemLink to="/">Go home</ItemLink>
      </template>
  </NuxtLayout>
</template>

<script setup lang="ts">

const route = useRoute();
const globalConfig = useGlobalConfig();

const isLoading = computed(() => !globalConfig.value);

const matchResult = computed(() => {
  // Handle loading state first
  if (isLoading.value || !globalConfig.value) {
    // Return default state while loading or if config is somehow still null
    return { isObjectMatch: false, isListingMatch: false };
  }

  // Config is loaded, proceed with matching
  const currentPath = route.path;
  // Directly access endpoints from globalConfig
  const objectEndpoints = globalConfig.value.objectEndpoints || [];
  const listingEndpoints = globalConfig.value.listingEndpoints || [];

  const isObjectMatch = matchesAnyPattern(currentPath, objectEndpoints);
  const isListingMatch = !isObjectMatch && matchesAnyPattern(currentPath, listingEndpoints);

  return { isObjectMatch, isListingMatch };
});

</script>
