<script lang="ts" setup>
import type { HTMLAttributes } from "vue";
import { cn } from "~/lib/utils";

const props = defineProps<{
    class?: HTMLAttributes["class"];
}>();

const content = useTemplateRef("content");
</script>

<template>
    <pre :class="cn('group bg-muted rounded-md relative p-4 min-h-[68px] text-sm', props.class)"><code class="" ref="content"><slot /></code><CopyButton :value="content?.innerText || ''" size="icon" variant="outline" class="absolute top-4 right-4 hidden group-hover:flex" iconOnly /></pre>
</template>
