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
