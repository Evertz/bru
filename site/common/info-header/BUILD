load("//ev/tooling/bazel/rules_ev_web:index.bzl", "ev_ng_module")

ev_ng_module(
    name = "info-header",
    srcs = glob(["*.ts"]),
    style = "info-header.component.scss",
    theme = "_info-header.theme.scss",
    assets = [
        "info-header.component.html",
    ],
    deps = [
        "//ev/tooling/bes/site/common/dash-pipe",

        "@npm//@angular/router",
        "@npm//@angular/material",
        "@npm//@angular/flex-layout",
    ],
    visibility = ["//ev/tooling/bes/site:__subpackages__"],
)
