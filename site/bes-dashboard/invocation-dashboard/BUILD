load("//ev/tooling/bazel/rules_ev_web:index.bzl", "ev_ng_module")

ev_ng_module(
    name = "invocation-dashboard",
    srcs = glob(["*.ts"]),
    theme = "_invocation-dashboard.theme.scss",
    style = "invocation-dashboard.component.scss",
    assets = [
        "invocation-dashboard.component.html",
    ],
    deps = [
        "//ev/tooling/bes/site/services",
        "//ev/tooling/bes/site/common/dash-pipe",
        "//ev/tooling/bes/site/common/summary-bar",

        "@npm//moment",
        "@npm//@angular/router",
        "@npm//@angular/material",
        "@npm//@angular/flex-layout",
    ],
    visibility = ["//ev/tooling/bes/site:__subpackages__"],
)
