load("//tools:index.bzl", "ng_module")

ng_module(
    name = "services",
    srcs = [
        "bru.service.ts",
        "config.service.ts",
    ],
    visibility = ["//site:__subpackages__"],
    deps = [
        "//types",
        "@npm//ansi-html",
        "@npm//socket.io-client",
    ],
)
