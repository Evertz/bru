load("//tools:index.bzl", "ng_module")

ng_module(
    name = "invocation-details",
    srcs = glob(["*.ts"]),
    assets = [
        "invocation-details.component.html",
    ],
    style = "invocation-details.component.scss",
    theme = "_invocation-details.theme.scss",
    visibility = ["//site:__subpackages__"],
    deps = [
        "//site/services",
        "//types",
        "@npm//@angular/flex-layout",
        "@npm//@angular/forms",
        "@npm//@angular/material",
        "@npm//@angular/router",
        "@npm//moment",
    ],
)
