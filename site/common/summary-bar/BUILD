load("//tools:index.bzl", "ng_module")

ng_module(
    name = "summary-bar",
    srcs = glob(["*.ts"]),
    assets = [
        "summary-bar.component.html",
    ],
    style = "summary-bar.component.scss",
    theme = "_summary-bar.theme.scss",
    visibility = ["//site:__subpackages__"],
    deps = [
        "//site/common/dash-pipe",
        "@npm//@angular/cdk",
        "@npm//@angular/flex-layout",
        "@npm//@angular/material",
        "@npm//@angular/router",
    ],
)
