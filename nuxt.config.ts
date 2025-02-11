// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-04-03",
    devtools: { enabled: true },
    modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt"],
    extends: [
        "prez-ui"
    ],
    app: {
        head: {
            title: "IDN Catalogue",
            link: [
                { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap", type: "text/css" }
            ]
        },
        baseURL: "/v1/AUTH_0a23562e67e04297b1dc3ce25a30858d/prezui4/",
    },
});
