<script setup lang="ts">
const props = defineProps<{
    contentonly?: boolean;
}>();
// const runtimeConfig = useRuntimeConfig();
const globalConfig = useGlobalConfig(); // needed for checking if SPARQL is enabled
const showDebugPanel = ref(false);
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <div class="w-full bg-yellow-300 text-black text-center py-1 px-4 text-sm font-medium">
             We are pleased to inform you that this site is under construction and will be updated as soon as possible
        </div>
        <MainNav />
        <IDNNav />
        <!-- page heading -->
        <slot v-if="!contentonly" name="header">
            <div class="bg-muted">
                <div class="container mx-auto flex flex-row">
                    <div class="px-4 py-4 grow">
                        <slot name="breadcrumb" />
	                    <div class="flex flex-row items-center justify-between gap-4 flex-wrap">
		                    <h1 class="text-3xl pb-4 pt-3">
			                    <slot name="header-text" />
		                    </h1>
		                    <div class="self-end ml-auto">
			                    <slot name="profiles" />
		                    </div>
	                    </div>
                    </div>
                    
                    <div v-if="showDebugPanel" class="m-2 bg-gray-200 rounded-lg text-[12px] leading-[12px]">
                        <slot name="debug" />
                    </div>
                </div>
            </div>
        </slot>
        <div v-else-if="showDebugPanel" class="bg-gray-100">
            <div class="container px-4 py-4 mx-auto">
                <slot name="debug" />
            </div>
        </div>

        <!-- content -->
        <div class="container mx-auto grow">
            <div class="px-4 py-4">
                <slot />
            </div>
        </div>

        <LayoutFooter />
    </div>
</template>
