load("//tools:index.bzl", "ng_module")

ng_module(
    name = "info-header",
    srcs = glob(["*.ts"]),
    assets = [
        "info-header.component.html",
    ],
    style = "info-header.component.scss",
    theme = "_info-header.theme.scss",
    visibility = ["//site:__subpackages__"],
    deps = [
        "//site/common/dash-pipe",
        "@npm//@angular/flex-layout",
        "@npm//@angular/material",
        "@npm//@angular/router",
    ],
)
