load("//tools:index.bzl", "ng_module")

ng_module(
    name = "home",
    srcs = [
        "home.component.ts",
        "home.module.ts",
    ],
    assets = [
        "home.component.html",
    ],
    style = "home.component.scss",
    theme = "_home.theme.scss",
    visibility = ["//site:__pkg__"],
    deps = [
        "//site/common/dash-pipe",
        "//site/common/info-header",
        "//site/common/summary-bar",
        "//site/services",
        "//types",
        "@npm//@angular/cdk",
        "@npm//@angular/flex-layout",
        "@npm//@angular/material",
        "@npm//@angular/router",
    ],
)
