<script setup lang="ts">
import { IDCHeader, IDCFooter, Acknowledgement, ARDCFooter, ScrollToTopButton, IDCLogo } from "@idn-au/idn-lib";

const defaultImage = "https://static.idnau.org/images/Milky_Way_IDN_Logo_75percent-fpng.webp";

const props = defineProps<{
    contentonly?: boolean;
}>();
const runtimeConfig = useRuntimeConfig();
const globalConfig = useGlobalConfig(); // needed for checking if SPARQL is enabled
</script>

<template>
    <div class="flex flex-col min-h-dvh">
        <IDCHeader baseUrl="https://data.idnau.org/search" />
        <IDNNav />
	    <main class="grow mb-12">
		    <div class="min-h-[300px] py-0 px-2 mb-6 flex flex-col justify-end bg-cover bg-no-repeat bg-center bg-blend-multiply relative" :style="{ background: `linear-gradient(transparent 75%, hsl(156 7.25% 13.53% / 60%)), url(${defaultImage})`, backgroundBlendMode: 'multiply', backgroundSize: 'cover', backgroundPosition: 'center' }">
			    <div class="mx-auto max-w-[1400px] w-full flex flex-row items-end">
				    <h1 class="text-white text-5xl mt-6">
					    <slot name="header-text" />
				    </h1>
				    <div class="self-end ml-auto mb-4">
					    <slot name="profiles" />
				    </div>
			    </div>
			    <!-- <IDCLogo class="fill-white absolute h-[750px] w-auto -top-[50px] right-0 opacity-20 saturate-10 brightness-140 -z-1" /> -->
		    </div>
		    <div class="mx-auto px-2 max-w-[1400px]">
			    <div class="mb-6">
				    <slot name="breadcrumb" />
			    </div>
			    <slot />
		    </div>
	    </main>
	    <Acknowledgement />
	    <IDCFooter />
	    <div class="dark bg-secondary text-secondary-foreground">
		    <div class="mx-auto max-w-[1200px] text-sm flex flex-row gap-2 items-center justify-center p-1">
			    <img src="/img/prez-logo.png" alt="Prez logo" class="size-6">
			    <span>
                    Prez <a href="https://github.com/RDFLib/prez-ui" target="_blank" rel="noopener noreferrer">UI</a> v{{ runtimeConfig.app.version }}<template v-if="globalConfig?.version">, <a href="https://github.com/RDFLib/prez" target="_blank" rel="noopener noreferrer">API</a> v{{ globalConfig?.version }}</template>
                </span>
		    </div>
	    </div>
	    <ScrollToTopButton />
    </div>
</template>

<style scoped>

</style>
