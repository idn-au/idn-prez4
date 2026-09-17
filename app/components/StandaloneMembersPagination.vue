<script lang="ts" setup>
import { ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from "lucide-vue-next";

const props = defineProps<{
	totalItems: number;
	maxReached: boolean;
}>();

const page = defineModel<number>("page", {default: 1});
const limit = defineModel<number>("limit", {default: 10});

const first = computed(() => (page.value - 1) * limit.value + 1)
</script>

<template>
	<div class="flex flex-col gap-2 mt-4 pagination">
		<Pagination v-if="props.totalItems > limit" v-slot="{ page }" :total="props.totalItems" :itemsPerPage="limit" :sibling-count="1" show-edges :page="page" class="paginator" v-model:page="page">
			<PaginationContent v-slot="{ items }" class="flex items-center gap-1 justify-center">
				<PaginationFirst as-child>
					<Button class="size-10 p-0" variant="outline">
						<ChevronsLeft class="size-4" />
					</Button>
				</PaginationFirst>
				<PaginationPrevious as-child>
					<Button class="size-10 p-0" variant="outline">
						<ChevronLeft class="size-4" />
					</Button>
				</PaginationPrevious>

				<template v-for="(item, index) in items">
					<PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
						<Button class="size-10 p-0" :variant="item.value === page ? 'default' : 'outline'">
							{{ item.value }}
						</Button>
					</PaginationItem>
					<PaginationEllipsis v-else :key="item.type" :index="index" />
				</template>

				<PaginationNext as-child>
					<Button class="size-10 p-0" variant="outline">
						<ChevronRight class="size-4" />
					</Button>
				</PaginationNext>
				<PaginationLast as-child>
					<Button class="size-10 p-0" variant="outline">
						<ChevronsRight class="size-4" />
					</Button>
				</PaginationLast>
			</PaginationContent>
		</Pagination>
		<StandaloneMembersLimitSelect v-model="limit" />
		<div v-if="props.totalItems > 0" class="pagination-text text-sm text-muted-foreground text-center">
			Showing {{ first }} to
			{{ Math.min(first + limit - 1, props.totalItems) }} of
			{{ props.totalItems }}{{ props.maxReached ? '' : '+' }} items
		</div>
	</div>
</template>