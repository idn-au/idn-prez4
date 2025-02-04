<script setup lang="ts">
import { Cog, ChevronRight, ChevronLeft } from "lucide-vue-next";

const props = defineProps<{sidepanel?: boolean, contentonly?: boolean}>()
const route = useRoute();
const appConfig = useAppConfig();
const runtimeConfig = useRuntimeConfig();
const globalConfig = useGlobalConfig();
const apiEndpoint = useGetPrezAPIEndpoint();
const altEndpoints = useGetPrezAPIAltEndpoints();
const menu = appConfig.menu;
const expandSidePanel = ref(false);
const showDebugPanel = ref(false);

const navLinks: { label: string; url: string }[] = [
    {
        label: "About Us",
        url: "https://idnau.org/about",
    },
    {
        label: "Resources",
        url: "https://idnau.org/resources",
    },
    {
        label: "Contact Us",
        url: "https://idnau.org/contact",
    },
];

onBeforeMount(() => {
    if (typeof localStorage !== 'undefined') {
        expandSidePanel.value = !!localStorage.getItem('expandSidePanel');
        showDebugPanel.value = runtimeConfig.public.prezDebug && !!localStorage.getItem('debug');
        watch(expandSidePanel, val => localStorage.setItem('expandSidePanel', val && '1' || ''));
        watch(showDebugPanel, val => localStorage.setItem('debug', val && '1' || ''));
    }
});
</script>

<template>
    <div class="flex flex-col min-h-screen">

        <!-- Header -->
        <header class="bg-background p-4 flex justify-between items-center">
            <div class="flex flex-row gap-3">
                <a href="https://idnau.org/" target="_blank" rel="noopener noreferrer">
                    <img src="/img/idn-logo-250.png" alt="IDN Logo" class="h-[80px]">
                </a>
                <div class="flex flex-col justify-center gap-1">
                    <a href="https://idnau.org/" target="_blank" rel="noopener noreferrer" class="text-2xl">The Indigenous Data Network</a>
                    <div class="flex flex-row">
                        <NuxtLink to="/" class="text-xl">IDN Catalogue</NuxtLink>
                    </div>
                </div>
            </div>
            <nav>
                <Button v-for="link in navLinks" variant="ghost" class="rounded-none" as-child>
                    <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
                </Button>
            </nav>
        </header>

        <!-- Navigation -->
        <div class="border-b relative">
            <nav class="container mx-auto px-4 py-4 hidden md:flex md:flex-row gap-2 text-lg">
                <Button v-for="{ label, url } in menu.filter(item => item.active !== false)" variant="ghost" :class="`rounded-none border-b-2 ${(url === '/' && route.path === '/') || (url !== '/' && route.path.startsWith(url)) ? 'border-b-isu-red' : 'border-b-transparent'}`">
                    <NuxtLink :to="url">{{ label }}</NuxtLink>
                </Button>
                <div v-if="runtimeConfig.public.prezDebug" class="!ml-auto">
                    <div v-if="showDebugPanel">
                        <span title="Toggle debug off" class="hover:cursor-pointer hover:text-gray-500 text-blue-400" @click="()=>{ showDebugPanel = !showDebugPanel }"><Cog class="w-4 h-4" /></span>
                    </div>
                    <span v-else title="Toggle debug on" class="hover:cursor-pointer hover:text-gray-500 text-gray-300" @click="()=>{ showDebugPanel = !showDebugPanel }"><Cog class="w-4 h-4" /></span>
                </div>
            </nav>
        </div>

        <slot v-if="!contentonly" name="header">
            <div class="bg-gray-100">
                <div class="container mx-auto flex flex-row">
                    <div class="px-4 py-4 flex-grow">
                        <slot name="breadcrumb" />
                        <div class="text-3xl pb-4 pt-3">
                            <slot name="header-text" />
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

        <div class="container mx-auto flex-grow">
            <div v-if="sidepanel" class="grid grid-cols-4 gap-4 px-4 py-4">
                <div :class="expandSidePanel ? 'col-span-3 relative' : 'col-span-4 relative'">
                    <slot />
                    <Button v-if="!expandSidePanel" title="Show sidepanel" variant="ghost" size="icon" class="absolute right-0 top-[-5px] pointer-events-auto" @click="expandSidePanel = !expandSidePanel">
                        <ChevronLeft class="size-4" />
                    </Button>
                </div>
                <div v-if="expandSidePanel" class="relative">
                    <slot name="sidepanel" />
                    <Button title="Hide sidepanel" variant="ghost" size="icon" class="absolute right-0 top-[-5px] pointer-events-auto" @click="expandSidePanel = !expandSidePanel">
                        <ChevronRight class="size-4" />
                    </Button>
                </div>
            </div>
            <div v-else class="px-4 py-4">
                <slot />
            </div>
        </div>

        <!-- Footer -->
        <footer class="bg-secondary">
            <div class="mx-auto max-w-[1200px] py-12 px-5 text-center">
                <div class="text-sm">The Indigenous Data Network acknowledges the Aboriginal and Torres Strait Islander Traditional Custodians of the lands on which we work and live. We pay respect to their Elders, past and present, and the place of Indigenous Knowledge in the academy and beyond. We acknowledge and respect that Aboriginal and Torres Strait Islander people have always used resources from the land and waters for nourishment, medicine and healing.</div>
                <div>&copy; Indigenous Data Network 2025</div>
            </div>
        </footer>
    </div>
</template>
