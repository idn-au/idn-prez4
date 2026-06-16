import type {AcceptableValue} from "reka-ui";
import type {ButtonVariants} from "~/components/ui/button";

export type Result = {
    iri: string;
    type: string[];
    label: string;
    description?: string;
    parent?: string;
    created?: string;
    url?: string;
    accessRights?: string[];
    keywords?: string[];
    addType?: string[];
    score?: number;
    geom?: string;
};

export type Option = {
    value: AcceptableValue;
    label?: string;
};

export type SPARQLResultsJSON = {
    head: {
        vars?: string[];
        link?: string[];
    },
    results?: {
        bindings: Record<string, {
            type: "uri" | "literal" | "bnode";
            value: string;
            "xml:lang"?: string;
            datatype?: string;
        }>[];
    },
    boolean?: boolean;
};

export type CustomIDCButtonVariants = "red" | "yellow" | "green" | "blue" | "black" | "dark-ghost";

export type IDCButtonVariants = ButtonVariants["variant"] | CustomIDCButtonVariants;
