/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                // This maps 'font-sans' to Inter
                sans: ["var(--font-inter)", "sans-serif"],
                // This maps 'font-serif' to Playfair Display
                serif: ["var(--font-playfair)", "serif"],
                serif: ['Merriweather', 'serif'], // Updates the font-serif class
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

