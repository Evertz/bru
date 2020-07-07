load("//tools:index.bzl", "ng_module")

ng_module(
    name = "fetched-list",
    srcs = glob(["*.ts"]),
    assets = [
        "fetched-list.component.html",
    ],
    style = "fetched-list.component.scss",
    theme = "_fetched-list.theme.scss",
    visibility = ["//site:__subpackages__"],
    deps = [
        "//site/services",
        "//types",
        "@npm//@angular/cdk",
        "@npm//@angular/flex-layout",
        "@npm//@angular/material",
        "@npm//@angular/router",
    ],
)
