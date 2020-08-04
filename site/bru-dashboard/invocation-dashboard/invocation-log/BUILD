load("//tools:index.bzl", "ng_module")

ng_module(
    name = "invocation-log",
    srcs = glob(["*.ts"]),
    assets = [
        "invocation-log.component.html",
    ],
    visibility = ["//site:__subpackages__"],
    deps = [
        "//site/services",
        "//site/common/console-view",
        "@npm//@angular/router",
    ],
)
