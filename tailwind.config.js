/** @type {import('tailwindcss').Config} */
module.exports = {
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                "isu-red": {
                    DEFAULT: "hsl(var(--isu-red))",
                    foreground: "hsl(var(--isu-red-foreground))",
                },
                "isu-yellow": {
                    DEFAULT: "hsl(var(--isu-yellow))",
                    foreground: "hsl(var(--isu-yellow-foreground))",
                },
                "isu-green": {
                    DEFAULT: "hsl(var(--isu-green))",
                    foreground: "hsl(var(--isu-green-foreground))",
                },
                "isu-blue": {
                    DEFAULT: "hsl(var(--isu-blue))",
                    foreground: "hsl(var(--isu-blue-foreground))",
                },
            },
        },
    },
}