load("//tools:index.bzl", "ng_module")

ng_module(
    name = "invocation-dashboard",
    srcs = glob(["*.ts"]),
    assets = [
        "invocation-dashboard.component.html",
    ],
    style = "invocation-dashboard.component.scss",
    theme = "_invocation-dashboard.theme.scss",
    theme_deps = [
        "//site/bru-dashboard/invocation-dashboard/invocation-details:invocation-details_theme",
        "//site/bru-dashboard/invocation-dashboard/invocation-log:invocation-log_theme",
        "//site/bru-dashboard/invocation-dashboard/target-details:target-details_theme",
    ],
    visibility = ["//site:__subpackages__"],
    deps = [
        "//site/common/dash-pipe",
        "//site/common/summary-bar",
        "//site/services",
        "//types",
        "@npm//@angular/flex-layout",
        "@npm//@angular/material",
        "@npm//@angular/router",
        "@npm//moment",
    ],
)
