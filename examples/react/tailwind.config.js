/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // 确保扫描 Vite 的入口文件
    "./src/**/*.{js,jsx,ts,tsx}", // 扫描所有的 React 组件文件
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

