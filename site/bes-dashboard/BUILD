load("//ev/tooling/bazel/rules_ev_web:index.bzl", "ev_ng_module")

ev_ng_module(
    name = "bes-dashboard",
    srcs = glob(["*.ts"]),
    style = "bes-dashboard.component.scss",
    theme = "_bes-dashboard.theme.scss",
    assets = [
        "bes-dashboard.component.html",
    ],
    deps = [
        "//ev/tooling/bes/site/services",
        "//ev/tooling/bes/site/common/info-header",
        "//ev/tooling/bes/site/common/status-bar",

        "@npm//@angular/router",
        "@npm//@angular/flex-layout",
    ],
    visibility = ["//ev/tooling/bes/site:__subpackages__"],
)
