<script lang="ts" setup>
import { Menu, Search } from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const appConfig = useAppConfig();

const showSidenav = ref(false);

router.beforeEach((from, to) => {
    showSidenav.value = false;
});
</script>

<template>
    <header class="sticky md:relative top-0 bg-background/60 p-2 z-50 backdrop-blur-sm flex flex-col gap-4">
        <!-- <div class="grid grid-cols-3 md:flex md:flex-row items-center gap-2"> -->
            <!-- mobile -->
            <Sheet v-model:open="showSidenav">
                <SheetTrigger as-child>
                    <Button variant="ghost" size="icon" class="md:hidden">
                        <Menu class="size-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" class="p-2" hideClose>
                    <SheetHeader class="grid grid-cols-3 gap-2 mb-4">
                        <SheetClose as-child>
                            <Button variant="ghost" size="icon">
                                <Menu class="size-4" />
                            </Button>
                        </SheetClose>
                        <a href="https://idnau.org" target="_blank" rel="noopener noreferrer" class="flex flex-row gap-2 items-center justify-center !text-black !hover:no-underline">
                            <img src="/img/idn-logo-250.png" alt="IDN Logo" class="h-[40px]" />
                            <span class="text-xl">IDN</span>
                        </a>
                        <div></div>
                    </SheetHeader>
                    <nav class="flex flex-col gap-2">
                        <Button
                            v-for="{ label, url } in appConfig.menu.filter(item => item.active !== false)"
                            variant="ghost"
                            :class="`rounded-none border-l-2 ${(url === '/' && route.path === '/') || (url !== '/' && route.path.startsWith(url)) ? 'border-l-isu-red bg-accent' : 'border-l-transparent'}`"
                            as-child
                        >
                            <NuxtLink :to="url">{{ label }}</NuxtLink>
                        </Button>
                        <hr />
                        <Button v-for="link in externalLinks" variant="ghost" class="rounded-none" as-child>
                            <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
                        </Button>
                    </nav>
                </SheetContent>
            </Sheet>
            <!-- <a href="https://idnau.org" target="_blank" rel="noopener noreferrer">
                <div class="flex flex-row gap-2 items-center justify-center">
                    <img src="/img/idn-logo-250.png" alt="IDN Logo" class="h-[40px] md:h-[54px]" />
                    <span class="hidden md:inline text-xl">The Indigenous Data Network</span>
                    <span class="md:hidden text-xl">IDN</span>
                </div>
            </a> -->
            <!-- desktop -->
            <!-- <nav class="hidden md:flex ml-auto">
                <Button v-for="link in externalLinks" variant="ghost" class="rounded-none" as-child>
                    <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
                </Button>
            </nav> -->
            <!-- <div class="flex flex-row justify-end">
                <Button variant="ghost" size="icon" title="Search the catalogue" as-child>
                    <NuxtLink to="/search"><Search /></NuxtLink>
                </Button>
            </div> -->
        <!-- </div> -->
        <div class="container hidden md:flex mx-auto">
            <nav class="flex flex-row gap-2">
                <Button
                    v-for="{ label, url } in appConfig.menu.filter(item => item.active !== false)"
                    variant="ghost"
                    :class="`hidden md:flex rounded-none border-b-2 ${(url === '/' && route.path === '/') || (url !== '/' && route.path.startsWith(url)) ? 'border-b-isu-red' : 'border-b-transparent'}`"
                    as-child
                >
                    <NuxtLink :to="url">{{ label }}</NuxtLink>
                </Button>
            </nav>
        </div>
    </header>
</template>
