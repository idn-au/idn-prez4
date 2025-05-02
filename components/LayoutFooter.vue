<script lang="ts" setup>
const runtimeConfig = useRuntimeConfig();
const globalConfig = useGlobalConfig();
</script>

<template>
    <footer class="bg-muted">
        <div class="mx-auto max-w-[1200px] py-12 px-5 text-center flex flex-col gap-4">
            <div class="text-sm">The Indigenous Data Network acknowledges the Aboriginal and Torres Strait Islander Traditional Custodians of the lands on which we work and live. We pay respect to their Elders, past and present, and the place of Indigenous Knowledge in the academy and beyond. We acknowledge and respect that Aboriginal and Torres Strait Islander people have always used resources from the land and waters for nourishment, medicine and healing.</div>
            <div>&copy; Indigenous Data Network 2025</div>
        </div>
        <div class="border-t">
            <div class="mx-auto max-w-[1200px] text-sm flex flex-row gap-2 items-center justify-center p-1">
                <img src="/img/prez-logo.png" alt="Prez logo" class="size-6">
                <span>
                    Prez <a href="https://github.com/RDFLib/prez-ui" target="_blank" rel="noopener noreferrer">UI</a> v{{ runtimeConfig.app.version }}<template v-if="globalConfig?.version">, <a href="https://github.com/RDFLib/prez" target="_blank" rel="noopener noreferrer">API</a> v{{ globalConfig?.version }}</template>
                </span>
            </div>
        </div>  
    </footer>
</template>
