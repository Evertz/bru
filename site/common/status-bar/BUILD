load("//ev/tooling/bazel/rules_ev_web:index.bzl", "ev_ng_module")

ev_ng_module(
    name = "status-bar",
    srcs = glob(["*.ts"]),
    theme = "_status-bar.theme.scss",
    style = "status-bar.component.scss",
    assets = [
        "status-bar.component.html",
    ],
    deps = [
        "@npm//@angular/material",
        "@npm//@angular/flex-layout",
    ],
    visibility = ["//ev/tooling/bes/site:__subpackages__"],
)
