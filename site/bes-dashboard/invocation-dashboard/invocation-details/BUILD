load("//ev/tooling/bazel/rules_ev_web:index.bzl", "ev_ng_module")

ev_ng_module(
    name = "invocation-details",
    srcs = glob(["*.ts"]),
    theme = "_invocation-details.theme.scss",
    style = "invocation-details.component.scss",
    assets = [
        "invocation-details.component.html",
    ],
    deps = [
        "//ev/tooling/bes/site/services",

        "@npm//moment",
        "@npm//@angular/material",
        "@npm//@angular/forms",
        "@npm//@angular/flex-layout",
        "@npm//@angular/router",
    ],
    visibility = ["//ev/tooling/bes/site:__subpackages__"],
)
