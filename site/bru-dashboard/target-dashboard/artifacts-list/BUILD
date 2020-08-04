load("//tools:index.bzl", "ng_module")

ng_module(
    name = "artifacts-list",
    srcs = [
        "artifacts-list.component.ts",
        "artifacts-list.module.ts",
    ],
    assets = ["artifacts-list.component.html"],
    style = "artifacts-list.component.scss",
    theme = "_artifacts-list.theme.scss",
    deps = [
        "//site/bru-dashboard/target-dashboard:utils",
        "//site/services",
        "//types",
        "@npm//@angular/cdk",
        "@npm//@angular/flex-layout",
        "@npm//@angular/material",
        "@npm//@angular/router",
    ],
    visibility = ["//site:__subpackages__"],
)
