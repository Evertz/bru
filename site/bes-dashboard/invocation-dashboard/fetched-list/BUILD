load("//ev/tooling/bazel/rules_ev_web:index.bzl", "ev_ng_module")

ev_ng_module(
    name = "fetched-list",
    srcs = glob(["*.ts"]),
    style = "fetched-list.component.scss",
    theme = "_fetched-list.theme.scss",
    assets = [
        "fetched-list.component.html",
    ],
    deps = [
        "//ev/tooling/bes/site/services",

        "@npm//@angular/material",
        "@npm//@angular/cdk",
        "@npm//@angular/flex-layout",
        "@npm//@angular/router",
    ],
    visibility = ["//ev/tooling/bes/site:__subpackages__"],
)
