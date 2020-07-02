load("//ev/tooling/bazel/rules_ev_web:index.bzl", "ev_ng_module")

ev_ng_module(
    name = "home",
    srcs = glob(["*.ts"]),
    theme = "_home.theme.scss",
    style = "home.component.scss",
    assets = [
        "home.component.html",
    ],
    deps = [
        "@npm//@angular/router",
        "@npm//@angular/material",
        "@npm//@angular/flex-layout",
        "@npm//@angular/cdk",
    ],
    visibility = ["//ev/tooling/bes/site:__subpackages__"],
)
