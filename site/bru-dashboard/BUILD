load("//tools:index.bzl", "ng_module")

ng_module(
    name = "bru-dashboard",
    srcs = glob(["*.ts"]),
    assets = [
        "bru-dashboard.component.html",
    ],
    style = "bru-dashboard.component.scss",
    theme = "_bru-dashboard.theme.scss",
    theme_deps = [
        "//site/bru-dashboard/invocation-dashboard:invocation-dashboard_theme",
        "//site/bru-dashboard/target-dashboard:target-dashboard_theme",
    ],
    visibility = ["//site:__subpackages__"],
    deps = [
        "//site/common/info-header",
        "//site/common/status-bar",
        "//site/services",
        "//types",
        "@npm//@angular/flex-layout",
        "@npm//@angular/router",
    ],
)
