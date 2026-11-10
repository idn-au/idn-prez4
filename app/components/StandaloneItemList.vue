<script lang="ts" setup>
import { type ItemListProps } from "prez-components";
import { ArrowUpDown, ArrowDownAZ, ArrowUpAZ, ExternalLink } from "lucide-vue-next";

const props = defineProps<ItemListProps>();

const sortBy = defineModel("sortBy");
const sortByDirection = defineModel("sortByDirection");

function toggleSort(predicate: string) {
	if (predicate === sortBy.value) {
		sortByDirection.value = sortByDirection.value === "ASC" ? "DESC" : "ASC";
	} else {
		sortBy.value = predicate;
		sortByDirection.value = "ASC";
	}
}
</script>

<template>
    <!-- ItemList -->
    <Table v-if="props.list" class="item-list min-w-[50rem]">
        <TableHeader>
            <TableRow>
                <TableHead>
                    <b>Item</b>
                    <Button :variant="sortBy === 'label' ? 'secondary' : 'ghost'" size="icon" @click="toggleSort('label')">
		                <template v-if="sortBy === 'label'">
			                <ArrowDownAZ v-if="sortByDirection === 'ASC'" class="size-4" />
			                <ArrowUpAZ v-else class="size-4" />
		                </template>
		                <ArrowUpDown v-else class="size-4" />
	                </Button>
                </TableHead>
                <template v-if="fields">
                    <TableHead v-for="col in fields">
                        <b>
                            <template v-if="col.node.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'">
                                Type
                                <a href="https://www.w3.org/1999/02/22-rdf-syntax-ns#type" title="The subject is an instance of a class." target="_blank">
                                    <ExternalLink class="size-4 inline" />
                                </a>
                            </template>
                            <Predicate v-else :predicate="col.node" :objects="[]" />
                        </b>
                        <Button :variant="sortBy === col.node.value ? 'secondary' : 'ghost'" size="icon" @click="toggleSort(col.node.value)">
		                    <template v-if="sortBy === col.node.value">
			                    <ArrowDownAZ v-if="sortByDirection === 'ASC'" class="size-4" />
			                    <ArrowUpAZ v-else class="size-4" />
		                    </template>
		                    <ArrowUpDown v-else class="size-4" />
	                    </Button>
                    </TableHead>
                </template>
	            <TableHead></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <template v-for="(item, index) in props.list">
                <TableRow :class="`hover:bg-unset border-none ${index % 2 ? 'bg-transparent' : 'bg-muted/50'}`">
                    <TableCell class="pb-1 font-bold max-w-xl whitespace-normal">
                        <Node :term="item" variant="item-list" />
                    </TableCell>
                    <template v-if="fields">
                        <TableCell v-for="col in fields" class="pb-1 max-w-sm whitespace-normal">
                            <Objects
                                v-if="item.properties?.[col.node.value]?.objects"
                                :term="col.node"
                                :predicate="col.node"
                                :objects="item.properties[col.node.value]?.objects.filter(o => !o.value.startsWith('https://olis.dev/'))"
                                variant="item-list"
                            />
                        </TableCell>
                    </template>
	                <TableCell class="w-px whitespace-nowrap">
		                <Button v-if="item.members" variant="outline" size="sm" asChild>
			                <NuxtLink :to="item.members.value">Members</NuxtLink>
		                </Button>
	                </TableCell>
                </TableRow>
                <TableRow :class="`border-b hover:bg-unset ${index % 2 ? 'bg-transparent' : 'bg-muted/50'}`">
                    <td class="p-4 pt-1 text-muted-foreground italic text-sm max-w-0 overflow-hidden text-ellipsis whitespace-nowrap" :colspan="2 + (fields?.length || 0)">{{ item.description?.value }}</td>
                </TableRow>
            </template>
        </TableBody>
    </Table>
</template>
