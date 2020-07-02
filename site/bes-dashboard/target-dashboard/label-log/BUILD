load("//ev/tooling/bazel/rules_ev_web:index.bzl", "ev_ng_module")

ev_ng_module(
    name = "label-log",
    srcs = glob(["*.ts"]),
    style = "label-log.component.scss",
    theme = "_label-log.theme.scss",
    assets = [
        "label-log.component.html",
    ],
    deps = [
        "//ev/tooling/bes/site/services",

        "@npm//moment",
        "@npm//@angular/material",
        "@npm//@angular/cdk",
        "@npm//@angular/flex-layout",
        "@npm//@angular/router",
    ],
    visibility = ["//ev/tooling/bes/site:__subpackages__"],
)
