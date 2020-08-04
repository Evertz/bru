load("//tools:index.bzl", "ng_module")

ng_module(
    name = "test-log-view",
    srcs = [
        "test-log-view.component.ts",
        "test-log-view.module.ts",
    ],
    assets = ["test-log-view.component.html"],
    deps = [
        "//site/services",
        "//site/bru-dashboard/target-dashboard:utils",
        "//site/common/console-view",
        "@npm//@angular/router",
    ],
    visibility = ["//site:__subpackages__"],
)
