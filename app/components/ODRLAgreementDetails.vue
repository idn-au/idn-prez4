<script lang="ts" setup>
const props = defineProps<{
    term: any;
    store: any;
    showDescription?: boolean;
}>();

const SCHEMA = "https://schema.org/";
const SKOS = "http://www.w3.org/2004/02/skos/core#";
const ODRL = "http://www.w3.org/ns/odrl/2/";

function properties(node: any): Record<string, any> {
    return {
        ...(node?.termType && props.store?.getProperties(node) || {}),
        ...(node?.properties || {}),
    };
}

function objects(predicate: string, node = props.term): any[] {
    return properties(node)?.[predicate]?.objects || [];
}

function displayValue(value: any): string {
    if (!value) return "";
    if (value.termType === "Literal") return value.value;
    if (value.label?.value) return value.label.value;

    const valueProperties = properties(value);
    const name = valueProperties[SCHEMA + "name"]?.objects?.[0]?.value
        || valueProperties[SKOS + "prefLabel"]?.objects?.[0]?.value;
    if (name) return name;
    if (value.value?.startsWith(ODRL)) return value.value.slice(ODRL.length);
    return value.value || "";
}

function values(predicate: string, node = props.term): string[] {
    return [...new Set(objects(predicate, node).map(displayValue).filter(Boolean))];
}

const name = computed(() => values(SCHEMA + "name")[0] || props.term.label?.value || "ODRL Agreement");
const description = computed(() => values(SCHEMA + "description"));
const rules = computed(() => [
    ["permission", "Permission"],
    ["prohibition", "Prohibition"],
    ["obligation", "Obligation"],
].flatMap(([predicate, kind]) => objects(ODRL + predicate).map(term => ({ term, kind }))));

function ruleName(rule: any): string {
    return values(SCHEMA + "name", rule.term)[0] || rule.kind;
}

function ruleFields(rule: any): [string, string[]][] {
    return [
        ["Description", values(SCHEMA + "description", rule.term)],
        ["Action", values(ODRL + "action", rule.term)],
        ["Assigner", values(ODRL + "assigner", rule.term)],
        ["Assignee", values(ODRL + "assignee", rule.term)],
        ["Citation", values(SCHEMA + "citation", rule.term)],
        ["Editorial note", values(SKOS + "editorialNote", rule.term)],
    ].filter(([, fieldValues]) => fieldValues.length) as [string, string[]][];
}

function targets(rule: any): any[] {
    return objects(ODRL + "target", rule.term);
}

function targetName(target: any): string {
    return values(SCHEMA + "name", target)[0] || displayValue(target) || "Target";
}

function targetDescriptions(target: any): string[] {
    return values(SCHEMA + "description", target);
}
</script>

<template>
    <article class="rounded-md border border-border bg-card p-4">
        <header class="mb-3">
            <h3 class="text-lg font-semibold">{{ name }}</h3>
            <div class="mt-1 break-all text-sm text-muted-foreground">{{ term.value }}</div>
            <template v-if="props.showDescription !== false">
                <p v-for="value in description" :key="value" class="mt-3 whitespace-pre-line">{{ value }}</p>
            </template>
        </header>

        <section v-for="rule in rules" :key="rule.term.value" class="mt-4 border-t pt-4">
            <div class="text-sm font-medium uppercase tracking-wide text-muted-foreground">{{ rule.kind }}</div>
            <h4 class="mt-1 font-semibold">{{ ruleName(rule) }}</h4>
            <div class="mt-1 break-all text-sm text-muted-foreground">{{ rule.term.value }}</div>
            <dl class="mt-3 divide-y border-t">
                <div v-for="([label, fieldValues]) in ruleFields(rule)" :key="label" class="grid gap-1 py-3 md:grid-cols-[12rem_1fr]">
                    <dt class="font-medium">{{ label }}</dt>
                    <dd>
                        <div v-for="value in fieldValues" :key="value" class="whitespace-pre-line break-words">{{ value }}</div>
                    </dd>
                </div>
            </dl>

            <div v-if="targets(rule).length" class="mt-4">
                <h5 class="font-medium">{{ targets(rule).length === 1 ? "Target" : "Targets" }}</h5>
                <div class="mt-2 grid gap-3">
                    <article v-for="target in targets(rule)" :key="target.value" class="rounded-md border bg-muted/20 p-4">
                        <div class="flex flex-wrap items-baseline justify-between gap-2">
                            <h6 class="font-semibold">{{ targetName(target) }}</h6>
                            <ItemLink v-if="target.links?.[0]?.value" :to="target.links[0].value">See full details</ItemLink>
                        </div>
                        <div class="mt-1 break-all text-sm text-muted-foreground">{{ target.value }}</div>
                        <p
                            v-for="value in targetDescriptions(target)"
                            :key="value"
                            class="mt-3 whitespace-pre-line break-words"
                        >{{ value }}</p>
                    </article>
                </div>
            </div>
        </section>
    </article>
</template>
