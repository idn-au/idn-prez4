<script lang="ts" setup>
import { Cog } from "lucide-vue-next";

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const appConfig = useAppConfig();

const showDebugPanel = defineModel<boolean>();
</script>

<template>
    <div class="border-b relative">
        <nav class="container mx-auto px-4 py-4 hidden md:flex md:flex-row gap-2 text-lg">
            <Button
                v-for="{ label, url } in appConfig.menu.filter(item => item.active !== false)"
                variant="ghost"
                :class="`rounded-none border-b-2 ${(url === '/' && route.path === '/') || (url !== '/' && route.path.startsWith(url)) ? 'border-b-isu-red' : 'border-b-transparent'}`"
                as-child
            >
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
</template>
