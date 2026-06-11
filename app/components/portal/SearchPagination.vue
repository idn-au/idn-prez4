<script setup lang="ts">
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-vue-next";
import PageLimitSelect from "~/components/portal/PageLimitSelect.vue";

const props = defineProps<{
	totalItems: number;
	showLimitSelect?: boolean;
}>();

const page = defineModel<number>("page", { default: 1 });
const limit = defineModel<number>("limit", { default: 10 });
</script>

<template>
	<Pagination v-slot="{ page }" :total="props.totalItems" v-model:page="page" :itemsPerPage="limit" :siblingCount="1" show-edges>
		<PaginationContent v-slot="{ items }" class="flex items-center gap-1 justify-center">
			<PaginationFirst asChild>
				<Button class="w-10 h-10 p-0" variant="outline">
					<ChevronsLeft class="size-4" />
				</Button>
			</PaginationFirst>
			<PaginationPrevious asChild>
				<Button class="w-10 h-10 p-0" variant="outline">
					<ChevronLeft class="size-4" />
				</Button>
			</PaginationPrevious>

			<template v-for="(item, index) in items">
				<PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" asChild>
					<Button class="w-10 h-10 p-0" :variant="item.value === page ? 'default' : 'outline'">
						{{ item.value }}
					</Button>
				</PaginationItem>
				<PaginationEllipsis v-else :key="item.type" :index="index" />
			</template>

			<PaginationNext :disabled="page === items.length" asChild>
				<Button class="w-10 h-10 p-0" variant="outline">
					<ChevronRight class="size-4" />
				</Button>
			</PaginationNext>
			<PaginationLast asChild>
				<Button class="w-10 h-10 p-0" variant="outline">
					<ChevronsRight class="size-4" />
				</Button>
			</PaginationLast>
		</PaginationContent>
	</Pagination>
	<PageLimitSelect v-if="props.showLimitSelect" v-model="limit" />
</template>
