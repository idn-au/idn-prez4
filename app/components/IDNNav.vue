<script lang="ts" setup>
const router = useRouter();
const route = useRoute();
const appConfig = useAppConfig();

const showSidenav = ref(false);

router.beforeEach((from, to) => {
    showSidenav.value = false;
});
</script>

<template>
	<div class="max-w-[1400px] w-full mx-auto">
		<nav class="flex flex-row">
			<Button
				v-for="{ label, url } in appConfig.menu.filter(item => item.active !== false)"
				variant="ghost"
				class="justify-center rounded-none border-b-2 px-1 md:px-3"
				:class="`md:flex rounded-none border-b-2 ${(url === '/' && route.path === '/') || (url !== '/' && route.path.startsWith(url)) ? 'border-b-isu-red' : 'border-b-transparent'}`"
				as-child
			>
				<NuxtLink :to="url">{{ label }}</NuxtLink>
			</Button>
		</nav>
	</div>
</template>
