
<script lang="ts" setup>
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
</script>

<template>
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
</template>
