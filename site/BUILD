load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary", "sass_library")
load("@npm_bazel_rollup//:index.bzl", "rollup_bundle")
load("@build_bazel_rules_nodejs//:index.bzl", "pkg_web")
load("//tools:index.bzl", "ng_module")
load("@npm//@babel/cli:index.bzl", "babel")
load("@npm//history-server:index.bzl", "history_server")
load("@npm//html-insert-assets:index.bzl", "html_insert_assets")
load("@npm_bazel_terser//:index.bzl", "terser_minified")

ng_module(
    name = "site",
    srcs = [
        "app.component.ts",
        "app.module.ts",
        "app-routing.module.ts",
        "main.prod.ts",
        "main.ts",
    ],
    assets = [
        "app.component.html",
    ],
    style = "app.component.scss",
    theme = "_app.theme.scss",
    theme_deps = [
        "//site/bru-dashboard:bru-dashboard_theme",
        "//site/common:common_theme",
        "//site/home:home_theme",
    ],
    deps = [
        "//site/bru-dashboard",
        "//site/bru-dashboard/invocation-dashboard",
        "//site/bru-dashboard/invocation-dashboard/fetched-list",
        "//site/bru-dashboard/invocation-dashboard/invocation-details",
        "//site/bru-dashboard/invocation-dashboard/invocation-log",
        "//site/bru-dashboard/invocation-dashboard/target-details",
        "//site/bru-dashboard/target-dashboard",
        "//site/home",
        "@npm//@angular/flex-layout",
        "@npm//@angular/material",
        "@npm//@angular/platform-browser",
        "@npm//@angular/router",
        "@npm//zone.js",
    ],
)

sass_library(
    name = "ng_theme",
    srcs = [
        "@npm//:node_modules/@angular/material/_theming.scss",
    ],
)

sass_binary(
    name = "styles",
    src = "styles.scss",
    deps = [
        ":ng_theme",
        ":site_theme",
    ],
)

rollup_bundle(
    name = "bundle",
    config_file = "rollup.config.js",
    entry_points = {
        ":main.ts": "index",
    },
    format = "iife",
    sourcemap = "inline",
    supports_workers = False,
    deps = [
        ":site",
        "@npm//rollup-plugin-commonjs",
        "@npm//rollup-plugin-json",
        "@npm//rollup-plugin-node-resolve",
        "@npm//rollup-plugin-sourcemaps",
    ],
)

history_server(
    name = "devserver",
    data = [
        "index.html",
        "index.js",
        ":styles",
        "//site/assets",
    ],
    templated_args = [
        "-a",
        "site",
    ],
)

rollup_bundle(
    name = "bundle-es2015",
    config_file = "rollup.config.js",
    entry_points = {
        ":main.prod.ts": "index",
    },
    output_dir = True,
    deps = [
        ":site",
        "@npm//rollup-plugin-commonjs",
        "@npm//rollup-plugin-json",
        "@npm//rollup-plugin-node-resolve",
        "@npm//rollup-plugin-sourcemaps",
    ],
)

babel(
    name = "bundle-es5",
    args = [
        "$(execpath :bundle-es2015)",
        "--no-babelrc",
        "--source-maps",
        "--presets=@babel/preset-env",
        "--out-dir",
        "$(@D)",
    ],
    data = [
        ":bundle-es2015",
        "@npm//@babel/preset-env",
    ],
    output_dir = True,
)

terser_minified(
    name = "bundle-es2015.min",
    src = ":bundle-es2015",
)

terser_minified(
    name = "bundle-es5.min",
    src = ":bundle-es5",
)

html_insert_assets(
    name = "inject_scripts_for_prod",
    outs = ["_prodapp/site/index.html"],
    args = [
        "--html=$(execpath //site/assets:index.prod.html)",
        "--out=$@",
        "--roots=. $(RULEDIR)",
        "--assets",
    ],
    data = ["//site/assets:index.prod.html"],
)

pkg_web(
    name = "prodapp",
    srcs = [
        "styles.css",
        ":bundle-es2015.min",
        ":bundle-es5.min",
        ":inject_scripts_for_prod",
        "//site/assets",
        "@npm//:node_modules/systemjs/dist/system.js",
    ],
    additional_root_paths = [
        "npm/node_modules/core-js/client",
        "npm/node_modules/systemjs/dist",
    ],
)

history_server(
    name = "prodserver",
    data = [":prodapp"],
    templated_args = [
        "-a",
        "$$(rlocation $(rootpath :prodapp))",
    ],
)
