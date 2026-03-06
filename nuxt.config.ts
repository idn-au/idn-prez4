import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-04-03",
    devtools: { enabled: true },
    modules: [ "shadcn-nuxt", "@nuxtjs/color-mode", "@nuxt/image"],
    extends: [
        "prez-ui"
    ],
    vite: {
        plugins: [tailwindcss()],
        optimizeDeps: {
            include: ["@triply/yasgui"]
        },
        vue: {
            template: {
                compilerOptions: {
                    whitespace: 'preserve' // for preserving whitespace in pre tag in slot
                },
            },
        },
    },
    app: {
        head: {
            title: "IDN Catalogue",
            link: [
                { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap", type: "text/css" },
            ]
        },
    },
    nitro: {
        prerender: {
            autoSubfolderIndex: false,
        },
    },
    shadcn: {
        prefix: "",
        componentDir: "./app/components/ui"
    },

});