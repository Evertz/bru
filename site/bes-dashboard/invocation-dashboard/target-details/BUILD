load("//tools:index.bzl", "ng_module")

ng_module(
    name = "target-details",
    srcs = glob(["*.ts"]),
    assets = [
        "target-details.component.html",
    ],
    style = "target-details.component.scss",
    theme = "_target-details.theme.scss",
    visibility = ["//site:__subpackages__"],
    deps = [
        "//site/common/duration-pipe",
        "//site/services",
        "//types",
        "@npm//@angular/cdk",
        "@npm//@angular/flex-layout",
        "@npm//@angular/forms",
        "@npm//@angular/material",
        "@npm//@angular/router",
        "@npm//lodash",
    ],
)
