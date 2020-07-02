load("//ev/tooling/bazel/rules_ev_web:index.bzl", "ev_ng_module")

ev_ng_module(
    name = "target-details",
    srcs = glob(["*.ts"]),
    theme = "_target-details.theme.scss",
    style = "target-details.component.scss",
    assets = [
        "target-details.component.html",
    ],
    deps = [
        "//ev/tooling/bes/site/services",
        "//ev/tooling/bes/site/common/duration-pipe",

        "@npm//@angular/material",
        "@npm//@angular/cdk",
        "@npm//@angular/forms",
        "@npm//@angular/flex-layout",
        "@npm//@angular/router",
        "@npm//lodash",
    ],
    visibility = ["//ev/tooling/bes/site:__subpackages__"],
)
