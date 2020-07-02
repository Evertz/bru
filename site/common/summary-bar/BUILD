load("//ev/tooling/bazel/rules_ev_web:index.bzl", "ev_ng_module")

ev_ng_module(
    name = "summary-bar",
    srcs = glob(["*.ts"]),
    theme = "_summary-bar.theme.scss",
    style = "summary-bar.component.scss",
    assets = [
        "summary-bar.component.html",
    ],
    deps = [
        "//ev/tooling/bes/site/common/dash-pipe",

        "@npm//@angular/router",
        "@npm//@angular/material",
        "@npm//@angular/flex-layout",
    ],
    visibility = ["//ev/tooling/bes/site:__subpackages__"],
)
