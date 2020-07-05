load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary", "sass_library")
load("@npm_bazel_rollup//:index.bzl", "rollup_bundle")
load("@npm//http-server:index.bzl", "http_server")
load("//tools:index.bzl", "ng_module")

ng_module(
    name = "site",
    srcs = [
        "app.component.ts",
        "app.module.ts",
        "app-routing.module.ts",
        "main.ts",
    ],
    assets = [
        "app.component.html",
    ],
    style = "app.component.scss",
    theme = "_app.theme.scss",
    theme_deps = [
        "//site/bes-dashboard:bes-dashboard_theme",
        "//site/common:common_theme",
        "//site/home:home_theme",
    ],
    deps = [
        "//site/bes-dashboard",
        "//site/bes-dashboard/invocation-dashboard",
        "//site/bes-dashboard/invocation-dashboard/fetched-list",
        "//site/bes-dashboard/invocation-dashboard/invocation-details",
        "//site/bes-dashboard/invocation-dashboard/invocation-log",
        "//site/bes-dashboard/invocation-dashboard/target-details",
        "//site/bes-dashboard/target-dashboard",
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
        ":site_theme",
        ":ng_theme",
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

http_server(
    name = "server",
    data = [
        "index.html",
        "index.js",
        ":styles",
        "//site/assets",
    ],
    templated_args = ["site"],
)
