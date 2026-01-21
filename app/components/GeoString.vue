<script lang="ts" setup>
const props = defineProps<{
    value: string;
}>();
</script>

<template>
    <div class="flex flex-row items-center gap-2">
        <span class="font-mono overflow-hidden overflow-ellipsis">{{ props.value }}</span>
        <CopyButton :value="props.value" iconOnly size="sm" variant="outline" />
    </div>
</template>
