load("//tools:index.bzl", "ng_module")

ng_module(
    name = "target-dashboard",
    srcs = glob(["*.ts"]),
    assets = [
        "target-dashboard.component.html",
    ],
    style = "target-dashboard.component.scss",
    theme = "_target-dashboard.theme.scss",
    visibility = ["//site:__subpackages__"],
    deps = [
        "//site/common/duration-pipe",
        "//site/common/summary-bar",
        "//site/services",
        "//types",
        "@npm//@angular/flex-layout",
        "@npm//@angular/forms",
        "@npm//@angular/material",
        "@npm//@angular/router",
        "@npm//moment",
    ],
)
