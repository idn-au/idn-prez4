import type {PrezNode} from "prez-lib";

/**
 * Sorts PrezNode objects by label, then by IRI
 *
 * @param a
 * @param b
 * @returns order score
 */
export function sortNodesByLabel(a: PrezNode, b: PrezNode): number {
    if (a.label && b.label) {
        return a.label.value.localeCompare(b.label.value);
    } else if (a.label) {
        return -1;
    } else if (b.label) {
        return 1;
    } else {
        return a.value.localeCompare(b.value);
    }
}

export async function sparqlQuery(url: string, query: string): Promise<Record<string, any>[]> {
    const r = await $fetch<SPARQLResultsJSON>(url, {
        headers: {
            "Accept": "application/sparql-results+json",
            "Content-Type": "application/sparql-query",
        },
        query: {
            query,
        },
    });
    return r.results?.bindings.map(result => {
        return Object.keys(result).reduce((obj, key) => {
            if (result[key]) {
                obj[key] = result[key].value;
            }
            return obj;
        }, {} as Record<string, any>);
    }) || [];
}
