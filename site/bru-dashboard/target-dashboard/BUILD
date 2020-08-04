load("@npm_bazel_typescript//:index.bzl", "ts_library")
load("//tools:index.bzl", "ng_module")

ng_module(
    name = "target-dashboard",
    srcs = glob(["*.ts"], exclude = ["target-dashboard-utils.ts"]),
    assets = [
        "target-dashboard.component.html",
    ],
    style = "target-dashboard.component.scss",
    theme = "_target-dashboard.theme.scss",
    theme_deps = [
      "//site/bru-dashboard/target-dashboard/artifacts-list:artifacts-list_theme",
    ],
    visibility = ["//site:__subpackages__"],
    deps = [
        "//site/common/duration-pipe",
        "//site/common/summary-bar",
        "//site/services",
        "//types",
        "@npm//@angular/flex-layout",
        "@npm//@angular/forms",
        "@npm//@angular/material",
        "@npm//@angular/router",
        "@npm//moment",
    ],
)

ts_library(
    name = "utils",
    srcs = ["target-dashboard-utils.ts"],
    visibility = ["//site/bru-dashboard/target-dashboard:__subpackages__"],
    deps = [
        "//site/services",
        "//types",
        "@npm//@angular/router",
        "@npm//rxjs",
    ],
)
