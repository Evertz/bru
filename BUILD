load("@npm_bazel_typescript//:index.bzl", "ts_config")

exports_files(
    [
        ".bzlgenrc",
        "tsconfig.json",
    ],
    visibility = ["//:__subpackages__"],
)

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    visibility = ["//:__subpackages__"],
    deps = [],
)

alias(
    name = "server",
    actual = "//src:bin",
)

alias(
    name = "ui",
    actual = "//site:devserver",
)
