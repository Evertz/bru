load("//ev/tooling/bazel/rules_ev_web:index.bzl", "ev_ng_module")

ev_ng_module(
    name = "invocation-log",
    srcs = glob(["*.ts"]),
    theme = "_invocation-log.theme.scss",
    style = "invocation-log.component.scss",
    assets = [
        "invocation-log.component.html",
    ],
    deps = [
        "//ev/tooling/bes/site/services",

        "@npm//moment",
        "@npm//@angular/material",
        "@npm//@angular/forms",
        "@npm//@angular/cdk",
        "@npm//@angular/flex-layout",
        "@npm//@angular/router",
    ],
    visibility = ["//ev/tooling/bes/site:__subpackages__"],
)
