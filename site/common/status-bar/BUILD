load("//tools:index.bzl", "ng_module")

ng_module(
    name = "status-bar",
    srcs = glob(["*.ts"]),
    assets = [
        "status-bar.component.html",
    ],
    style = "status-bar.component.scss",
    theme = "_status-bar.theme.scss",
    visibility = ["//site:__subpackages__"],
    deps = [
        "@npm//@angular/flex-layout",
        "@npm//@angular/material",
    ],
)
