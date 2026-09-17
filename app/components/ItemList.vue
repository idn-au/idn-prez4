<script lang="ts" setup>
import { type ItemListProps } from "prez-components";

const props = defineProps<ItemListProps>();
</script>

<template>
    <!-- ItemList -->
    <Table v-if="props.list" class="item-list min-w-[50rem]">
        <TableHeader>
            <TableRow>
                <TableHead><b>Item</b></TableHead>
                <template v-if="fields">
                    <TableHead v-for="col in fields">
                        <b><Predicate :predicate="col.node" :objects="[]" /></b>
                    </TableHead>
                </template>
	            <TableHead></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <template v-for="(item, index) in props.list">
                <TableRow :class="`hover:bg-unset border-none ${index % 2 ? 'bg-transparent' : 'bg-muted/50'}`">
                    <TableCell class="pb-1 font-bold">
                        <Node :term="item" variant="item-list" />
                    </TableCell>
                    <template v-if="fields">
                        <TableCell v-for="col in fields" class="pb-1">
                            <Objects
                                v-if="item.properties?.[col.node.value]?.objects"
                                :term="col.node"
                                :predicate="col.node"
                                :objects="item.properties[col.node.value]?.objects"
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
