load("//ev/tooling/bazel/rules_ev_web:index.bzl", "ev_ng_module")

ev_ng_module(
    name = "target-dashboard",
    srcs = glob(["*.ts"]),
    style = "target-dashboard.component.scss",
    theme = "_target-dashboard.theme.scss",
    assets = [
        "target-dashboard.component.html",
    ],
    deps = [
        "//ev/tooling/bes/site/services",
        "//ev/tooling/bes/site/common/summary-bar",
        "//ev/tooling/bes/site/common/duration-pipe",

        "@npm//moment",
        "@npm//@angular/router",
        "@npm//@angular/forms",
        "@npm//@angular/material",
        "@npm//@angular/flex-layout",
    ],
    visibility = ["//ev/tooling/bes/site:__subpackages__"],
)
