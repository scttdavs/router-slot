import path from "path";
import pkg from "./package.json";
import {
	defaultExternals,
	defaultOutputConfig,
	defaultPlugins,
	defaultProdPlugins,
	defaultServePlugins,
	isLibrary,
	isProd,
	isServe
} from "@appnest/web-config";

const folders = {
	dist: path.resolve(__dirname, "dist"),
	src: path.resolve(__dirname, "src/demo")
};

const files = {
	main: path.join(folders.src, "app.ts"),
	src_index: path.join(folders.src, "index.html"),
	dist_index: path.join(folders.dist, "index.html")
};

export default {
	input: {
		main: files.main
	},
	output: [
		defaultOutputConfig({
			format: "esm",
			dir: folders.dist
		})
	],
	plugins: [
		...defaultPlugins({
			cleanConfig: {
				targets: [
					folders.dist
				]
			},
			htmlTemplateConfig: {
				template: files.src_index,
				target: files.dist_index,
				include: /main(-.*)?\.js$/
			}
		}),

		// Serve
		...(isServe ? [
			...defaultServePlugins({
				serveConfig: {
					port: 1338,
					contentBase: folders.dist
				},
				livereloadConfig: {
					watch: folders.dist
				}
			})
		] : []),

		// Production
		...(isProd ? [
			...defaultProdPlugins({
				dist: folders.dist,
				minifyLitHtmlConfig: {
					verbose: false
				},
				visualizerConfig: {
					filename: path.join(folders.dist, "stats.html")
				},
				licenseConfig: {
					thirdParty: {
						output: path.join(folders.dist, "licenses.txt")
					}
				},
				budgetConfig: {
					sizes: {
						".js": 1024 * 200
					}
				}
			})
		] : [])
	],
	external: [
		...(isLibrary ? [
			...defaultExternals(pkg)
		] : [])
	],
	treeshake: isProd,
	context: "window"
}
