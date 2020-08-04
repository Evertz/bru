load("//tools:index.bzl", "ng_module")

ng_module(
    name = "console-view",
    srcs = [
        "console-view.component.ts",
        "console-view.module.ts",
    ],
    assets = ["console-view.component.html"],
    style = "console-view.component.scss",
    theme = "_console-view.theme.scss",
    deps = [
        "@npm//@angular/cdk",
        "@npm//@angular/platform-browser",
        "@npm//@angular/flex-layout",
        "@npm//@angular/material",
        "@npm//@angular/router",
    ],
    visibility = ["//site:__subpackages__"],
)
