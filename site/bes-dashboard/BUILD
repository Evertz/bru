load("//tools:index.bzl", "ng_module")

ng_module(
    name = "bes-dashboard",
    srcs = glob(["*.ts"]),
    assets = [
        "bes-dashboard.component.html",
    ],
    style = "bes-dashboard.component.scss",
    theme = "_bes-dashboard.theme.scss",
    theme_deps = [
        "//site/bes-dashboard/invocation-dashboard:invocation-dashboard_theme",
        "//site/bes-dashboard/target-dashboard:target-dashboard_theme",
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
