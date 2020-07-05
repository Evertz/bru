load("//tools:index.bzl", "ng_module")

ng_module(
    name = "invocation-log",
    srcs = glob(["*.ts"]),
    assets = [
        "invocation-log.component.html",
    ],
    style = "invocation-log.component.scss",
    theme = "_invocation-log.theme.scss",
    visibility = ["//site:__subpackages__"],
    deps = [
        "//site/services",
        "@npm//@angular/cdk",
        "@npm//@angular/flex-layout",
        "@npm//@angular/forms",
        "@npm//@angular/material",
        "@npm//@angular/platform-browser",
        "@npm//@angular/router",
        "@npm//moment",
    ],
)
