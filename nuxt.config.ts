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
            link: [
                { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap", type: "text/css" },
                { rel: "icon", type: "image/png", href: "/favicon-96x96.png", sizes: "96x96" },
                { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
                { rel: "shortcut icon", href: "/favicon.ico" },
                { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
                { rel: "manifest", href: "/site.webmanifest" },
            ],
            meta: [
                { name: "apple-mobile-web-app-title", content: "National Indigenous Data Catalogue" },
            ],
            title: "National Indigenous Data Catalogue",
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